import { db } from '$lib/server/db';
import { events, courses, registrations, submissions } from '$lib/server/db/schema';
import { eq, and, count, ne, asc } from 'drizzle-orm';
import { error } from '@sveltejs/kit';
import { renderMarkdown } from '$lib/server/markdown';

export async function load({ params }) {
	const [event] = await db
		.select()
		.from(events)
		.where(eq(events.arrangementId, params.arrangementId));

	if (!event) throw error(404, 'Arrangement ikke funnet');

	const eventCourses = await db
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

	// Fetch registrations per course
	const courseIds = eventCourses.map((r) => r.course.courseId);
	let courseRegistrations: Record<string, Array<{
		registrationId: string;
		childName: string;
		childAge: number;
		parentName: string;
		parentEmail: string;
		status: string;
		waitlistPosition: number | null;
	}>> = {};

	for (const courseId of courseIds) {
		const regs = await db
			.select({
				registrationId: registrations.registrationId,
				childName: registrations.childName,
				childAge: registrations.childAge,
				parentName: registrations.parentName,
				parentEmail: registrations.parentEmail,
				status: registrations.status,
				waitlistPosition: registrations.waitlistPosition
			})
			.from(registrations)
			.where(and(
				eq(registrations.courseId, courseId),
				ne(registrations.status, 'cancelled')
			))
			.orderBy(asc(registrations.createdAt));

		courseRegistrations[courseId] = regs;
	}

	const eventSubmissions = await db
		.select()
		.from(submissions)
		.where(eq(submissions.arrangementId, params.arrangementId))
		.orderBy(asc(submissions.createdAt));

	return {
		event,
		courses: eventCourses.map((r) => ({
			...r.course,
			confirmedCount: Number(r.confirmedCount)
		})),
		courseRegistrations,
		submissions: await Promise.all(eventSubmissions.map(async (s) => ({
			...s,
			descriptionHtml: await renderMarkdown(s.description),
			speakerBioHtml: await renderMarkdown(s.speakerBio)
		})))
	};
}
