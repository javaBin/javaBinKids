import { db } from '$lib/server/db';
import { events, courses, registrations } from '$lib/server/db/schema';
import { eq, and, count } from 'drizzle-orm';
import { error } from '@sveltejs/kit';
import { renderMarkdown } from '$lib/server/markdown';

export async function load({ params }) {
	const [event] = await db
		.select()
		.from(events)
		.where(eq(events.arrangementId, params.arrangementId));

	if (!event) throw error(404, 'Arrangement ikke funnet');

	const [course] = await db
		.select()
		.from(courses)
		.where(
			and(
				eq(courses.courseId, params.courseId),
				eq(courses.arrangementId, params.arrangementId)
			)
		);

	if (!course) throw error(404, 'Kurs ikke funnet');

	const [{ confirmedCount }] = await db
		.select({ confirmedCount: count() })
		.from(registrations)
		.where(
			and(
				eq(registrations.courseId, course.courseId),
				eq(registrations.status, 'confirmed')
			)
		);

	const [{ waitlistedCount }] = await db
		.select({ waitlistedCount: count() })
		.from(registrations)
		.where(
			and(
				eq(registrations.courseId, course.courseId),
				eq(registrations.status, 'waitlisted')
			)
		);

	const spotsLeft = course.maxParticipants - Number(confirmedCount);

	const now = new Date();
	const registrationOpen =
		!event.cancelled &&
		new Date(event.registrationOpens) <= now &&
		new Date(event.registrationCloses) >= now;

	const courseWithHtml = {
		...course,
		descriptionHtml: await renderMarkdown(course.description)
	};

	return {
		event,
		course: courseWithHtml,
		spotsLeft,
		confirmedCount: Number(confirmedCount),
		waitlistedCount: Number(waitlistedCount),
		registrationOpen
	};
}
