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

	const coursesWithCounts = await db
		.select({
			course: courses,
			confirmedCount: count(registrations.registrationId)
		})
		.from(courses)
		.leftJoin(
			registrations,
			and(
				eq(registrations.courseId, courses.courseId),
				eq(registrations.status, 'confirmed')
			)
		)
		.where(eq(courses.arrangementId, params.arrangementId))
		.groupBy(courses.courseId);

	const eventCourses = coursesWithCounts.map((row) => ({
		...row.course,
		confirmedCount: Number(row.confirmedCount)
	}));

	const now = new Date();
	const registrationOpen =
		!event.cancelled &&
		new Date(event.registrationOpens) <= now &&
		new Date(event.registrationCloses) >= now;

	const submissionsOpen =
		event.openForSubmissions &&
		event.submissionDeadline !== null &&
		new Date(event.submissionDeadline) > new Date();

	const eventWithHtml = {
		...event,
		descriptionHtml: await renderMarkdown(event.description)
	};

	const coursesWithHtml = await Promise.all(
		eventCourses.map(async (c) => ({
			...c,
			introductionHtml: await renderMarkdown(c.introduction || c.description)
		}))
	);

	return { event: eventWithHtml, courses: coursesWithHtml, registrationOpen, submissionsOpen };
}
