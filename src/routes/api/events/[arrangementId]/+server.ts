import { json, error } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { events, courses, registrations } from '$lib/server/db/schema';
import { eq, and, ne, count } from 'drizzle-orm';
import { validateSession } from '$lib/server/auth';

export async function PATCH({ params, request, cookies }) {
	const adminUserId = await validateSession(cookies);
	if (!adminUserId) throw error(401, 'Ikke autorisert');

	const body = await request.json();
	const data = body.event;

	const dateFields = ['date', 'registrationOpens', 'registrationCloses', 'submissionDeadline'] as const;
	for (const field of dateFields) {
		if (typeof data[field] === 'string') {
			data[field] = new Date(data[field]);
		}
	}

	const [updated] = await db
		.update(events)
		.set(data)
		.where(eq(events.arrangementId, params.arrangementId))
		.returning();

	if (!updated) throw error(404, 'Arrangement ikke funnet');
	return json({ event: { id: updated.arrangementId, ...updated } });
}

export async function DELETE({ params, cookies }) {
	const adminUserId = await validateSession(cookies);
	if (!adminUserId) throw error(401, 'Ikke autorisert');

	const eventCourses = await db.select().from(courses).where(eq(courses.arrangementId, params.arrangementId));
	for (const course of eventCourses) {
		const [{ activeCount }] = await db
			.select({ activeCount: count() })
			.from(registrations)
			.where(and(eq(registrations.courseId, course.courseId), ne(registrations.status, 'cancelled')));
		if (Number(activeCount) > 0) {
			throw error(400, 'Kan ikke slette arrangement med aktive påmeldinger');
		}
	}

	for (const course of eventCourses) {
		await db.delete(courses).where(eq(courses.courseId, course.courseId));
	}
	await db.delete(events).where(eq(events.arrangementId, params.arrangementId));
	return new Response(null, { status: 200 });
}
