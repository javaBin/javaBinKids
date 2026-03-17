import { json, error } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { registrations, courses, events } from '$lib/server/db/schema';
import { eq, and, asc, sql } from 'drizzle-orm';
import { sendCancellationEmail, sendPromotionEmail } from '$lib/server/email';

export async function POST({ params, url }) {
	const token = url.searchParams.get('token');
	if (!token) throw error(400, 'Token mangler');

	const [registration] = await db
		.select()
		.from(registrations)
		.where(
			and(
				eq(registrations.registrationId, params.registrationId),
				eq(registrations.cancellationToken, token)
			)
		);

	if (!registration) throw error(404, 'Påmelding ikke funnet');
	if (registration.status === 'cancelled') throw error(400, 'Allerede avmeldt');

	const wasConfirmed = registration.status === 'confirmed';

	// Cancel the registration
	await db
		.update(registrations)
		.set({ status: 'cancelled', waitlistPosition: null })
		.where(eq(registrations.registrationId, params.registrationId));

	// Get course and event info for emails
	const [course] = await db.select().from(courses).where(eq(courses.courseId, registration.courseId));
	const [event] = await db.select().from(events).where(eq(events.arrangementId, course.arrangementId));

	// Send cancellation email
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

	// If was confirmed, promote next from waitlist
	if (wasConfirmed) {
		const [nextWaitlisted] = await db
			.select()
			.from(registrations)
			.where(
				and(
					eq(registrations.courseId, registration.courseId),
					eq(registrations.status, 'waitlisted')
				)
			)
			.orderBy(asc(registrations.waitlistPosition))
			.limit(1);

		if (nextWaitlisted) {
			await db
				.update(registrations)
				.set({ status: 'confirmed', waitlistPosition: null })
				.where(eq(registrations.registrationId, nextWaitlisted.registrationId));

			// Decrement remaining waitlist positions
			await db.execute(
				sql`UPDATE registrations SET "waitlistPosition" = "waitlistPosition" - 1 WHERE "courseId" = ${registration.courseId} AND status = 'waitlisted' AND "waitlistPosition" IS NOT NULL`
			);

			try {
				const eventDate = new Date(event.date).toLocaleDateString('nb-NO', {
					day: 'numeric',
					month: 'long',
					year: 'numeric'
				});

				await sendPromotionEmail({
					parentEmail: nextWaitlisted.parentEmail,
					parentName: nextWaitlisted.parentName,
					childName: nextWaitlisted.childName,
					courseTitle: course.title,
					eventTitle: event.title,
					eventDate
				});
			} catch (e) {
				console.error('Failed to send promotion email:', e);
			}
		}
	}

	return json({ message: 'Påmelding avbestilt' });
}
