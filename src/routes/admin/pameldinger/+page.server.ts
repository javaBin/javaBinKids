import { db } from '$lib/server/db';
import { registrations, courses, events } from '$lib/server/db/schema';
import { eq, desc } from 'drizzle-orm';

export async function load({ url }) {
	const statusFilter = url.searchParams.get('status');

	const allRegistrations = await db
		.select({
			registration: registrations,
			courseTitle: courses.title,
			eventTitle: events.title,
			courseId: courses.courseId
		})
		.from(registrations)
		.innerJoin(courses, eq(registrations.courseId, courses.courseId))
		.innerJoin(events, eq(courses.arrangementId, events.arrangementId))
		.orderBy(desc(registrations.createdAt));

	const filtered = statusFilter
		? allRegistrations.filter((r) => r.registration.status === statusFilter)
		: allRegistrations;

	const allCourses = await db
		.select({ courseId: courses.courseId, title: courses.title, eventTitle: events.title })
		.from(courses)
		.innerJoin(events, eq(courses.arrangementId, events.arrangementId));

	return { registrations: filtered, courses: allCourses, statusFilter };
}
