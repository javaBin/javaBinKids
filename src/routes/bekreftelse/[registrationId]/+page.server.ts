import { db } from '$lib/server/db';
import { registrations, courses, events } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { error } from '@sveltejs/kit';

export async function load({ params, url }) {
	const token = url.searchParams.get('token');
	if (!token) throw error(400, 'Token mangler');

	const [registration] = await db
		.select()
		.from(registrations)
		.where(eq(registrations.registrationId, params.registrationId));

	if (!registration || registration.cancellationToken !== token) {
		throw error(404, 'Påmelding ikke funnet');
	}

	const [course] = await db.select().from(courses).where(eq(courses.courseId, registration.courseId));
	const [event] = await db.select().from(events).where(eq(events.arrangementId, course.arrangementId));

	return {
		registration: {
			childName: registration.childName,
			childAge: registration.childAge,
			parentName: registration.parentName,
			parentEmail: registration.parentEmail,
			status: registration.status,
			waitlistPosition: registration.waitlistPosition,
			createdAt: registration.createdAt
		},
		course: {
			title: course.title,
			ageMin: course.ageMin,
			ageMax: course.ageMax
		},
		event: {
			title: event.title,
			date: event.date,
			location: event.location
		}
	};
}
