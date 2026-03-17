import { json, error } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { events, courses, registrations } from '$lib/server/db/schema';
import { eq, and } from 'drizzle-orm';
import { validateSession } from '$lib/server/auth';
import { sendReminderEmail } from '$lib/server/email';

export async function POST({ params, cookies }) {
	const adminUserId = await validateSession(cookies);
	if (!adminUserId) throw error(401, 'Ikke autorisert');

	const [event] = await db
		.select()
		.from(events)
		.where(eq(events.arrangementId, params.arrangementId));

	if (!event) throw error(404, 'Arrangement ikke funnet');

	const eventCourses = await db
		.select()
		.from(courses)
		.where(eq(courses.arrangementId, params.arrangementId));

	const eventDate = new Date(event.date).toLocaleDateString('nb-NO', {
		weekday: 'long',
		day: 'numeric',
		month: 'long',
		year: 'numeric',
		hour: '2-digit',
		minute: '2-digit'
	});

	let sentCount = 0;

	for (const course of eventCourses) {
		const confirmedRegs = await db
			.select()
			.from(registrations)
			.where(
				and(
					eq(registrations.courseId, course.courseId),
					eq(registrations.status, 'confirmed')
				)
			);

		for (const reg of confirmedRegs) {
			try {
				await sendReminderEmail({
					parentEmail: reg.parentEmail,
					parentName: reg.parentName,
					childName: reg.childName,
					courseTitle: course.title,
					eventTitle: event.title,
					eventDate,
					eventLocation: event.location
				});
				sentCount++;
			} catch (e) {
				console.error(`Failed to send reminder to ${reg.parentEmail}:`, e);
			}
		}
	}

	return json({ sentCount });
}
