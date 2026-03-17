import { json, error } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { registrations, courses, events } from '$lib/server/db/schema';
import { eq, and, asc, sql } from 'drizzle-orm';
import { validateSession } from '$lib/server/auth';
import { sendCancellationEmail, sendPromotionEmail } from '$lib/server/email';

export async function PATCH({ params, request, cookies }) {
	const adminUserId = await validateSession(cookies);
	if (!adminUserId) throw error(401, 'Ikke autorisert');

	const body = await request.json();
	const data = body.registration;

	const [registration] = await db
		.select()
		.from(registrations)
		.where(eq(registrations.registrationId, params.registrationId));

	if (!registration) throw error(404, 'Påmelding ikke funnet');

	if (data.status === 'cancelled' && registration.status !== 'cancelled') {
		const wasConfirmed = registration.status === 'confirmed';

		await db
			.update(registrations)
			.set({ status: 'cancelled', waitlistPosition: null })
			.where(eq(registrations.registrationId, params.registrationId));

		const [course] = await db.select().from(courses).where(eq(courses.courseId, registration.courseId));
		const [event] = await db.select().from(events).where(eq(events.arrangementId, course.arrangementId));

		try {
			await sendCancellationEmail({
				parentEmail: registration.parentEmail,
				parentName: registration.parentName,
				childName: registration.childName,
				courseTitle: course.title
			});
		} catch (e) {
			console.error('Failed to send cancellation email:', e);
		}

		if (wasConfirmed) {
			const [next] = await db
				.select()
				.from(registrations)
				.where(and(eq(registrations.courseId, registration.courseId), eq(registrations.status, 'waitlisted')))
				.orderBy(asc(registrations.waitlistPosition))
				.limit(1);

			if (next) {
				await db
					.update(registrations)
					.set({ status: 'confirmed', waitlistPosition: null })
					.where(eq(registrations.registrationId, next.registrationId));

				await db.execute(
					sql`UPDATE registrations SET "waitlistPosition" = "waitlistPosition" - 1 WHERE "courseId" = ${registration.courseId} AND status = 'waitlisted' AND "waitlistPosition" IS NOT NULL`
				);

				try {
					await sendPromotionEmail({
						parentEmail: next.parentEmail,
						parentName: next.parentName,
						childName: next.childName,
						courseTitle: course.title,
						eventTitle: event.title,
						eventDate: new Date(event.date).toLocaleDateString('nb-NO')
					});
				} catch (e) {
					console.error('Failed to send promotion email:', e);
				}
			}
		}
	}

	return new Response(null, { status: 200 });
}
