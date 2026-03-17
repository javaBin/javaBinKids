import { json, error } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { courses } from '$lib/server/db/schema';
import { validateSession } from '$lib/server/auth';
import { courseSchema } from '$lib/server/validation';

export async function POST({ request, cookies }) {
	const adminUserId = await validateSession(cookies);
	if (!adminUserId) throw error(401, 'Ikke autorisert');

	const body = await request.json();
	const parsed = courseSchema.safeParse(body.course);
	if (!parsed.success) return json({ errors: parsed.error.flatten().fieldErrors }, { status: 400 });

	const [course] = await db
		.insert(courses)
		.values({
			arrangementId: parsed.data.arrangementId,
			title: parsed.data.title,
			introduction: parsed.data.introduction,
			description: parsed.data.description,
			thumbnailUrl: parsed.data.thumbnailUrl || null,
			ageMin: parsed.data.ageMin,
			ageMax: parsed.data.ageMax,
			maxParticipants: parsed.data.maxParticipants
		})
		.returning();

	return json({ course: { id: course.courseId, ...course } });
}
