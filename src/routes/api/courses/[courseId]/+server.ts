import { json, error } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { courses, registrations } from '$lib/server/db/schema';
import { eq, and, ne, count } from 'drizzle-orm';
import { validateSession } from '$lib/server/auth';

export async function PATCH({ params, request, cookies }) {
	const adminUserId = await validateSession(cookies);
	if (!adminUserId) throw error(401, 'Ikke autorisert');

	const body = await request.json();
	const data = body.course;

	const [updated] = await db
		.update(courses)
		.set(data)
		.where(eq(courses.courseId, params.courseId))
		.returning();

	if (!updated) throw error(404, 'Kurs ikke funnet');
	return json({ course: { id: updated.courseId, ...updated } });
}

export async function DELETE({ params, cookies }) {
	const adminUserId = await validateSession(cookies);
	if (!adminUserId) throw error(401, 'Ikke autorisert');

	const [{ activeCount }] = await db
		.select({ activeCount: count() })
		.from(registrations)
		.where(
			and(
				eq(registrations.courseId, params.courseId),
				ne(registrations.status, 'cancelled')
			)
		);

	if (Number(activeCount) > 0) {
		throw error(400, 'Kan ikke slette kurs med aktive påmeldinger');
	}

	await db.delete(courses).where(eq(courses.courseId, params.courseId));
	return new Response(null, { status: 200 });
}
