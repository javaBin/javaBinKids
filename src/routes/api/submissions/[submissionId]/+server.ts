import { json, error } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { submissions, events } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { submissionUpdateSchema } from '$lib/server/validation';

export async function GET({ params, url }) {
	const token = url.searchParams.get('token');
	if (!token) throw error(401, 'Token mangler');

	const [submission] = await db
		.select()
		.from(submissions)
		.where(eq(submissions.submissionId, params.submissionId));

	if (!submission) throw error(404, 'Innlegg ikke funnet');
	if (submission.editToken !== token) throw error(403, 'Ugyldig token');

	return json({ submission });
}

export async function PATCH({ params, url, request }) {
	const token = url.searchParams.get('token');
	if (!token) throw error(401, 'Token mangler');

	const [submission] = await db
		.select()
		.from(submissions)
		.where(eq(submissions.submissionId, params.submissionId));

	if (!submission) throw error(404, 'Innlegg ikke funnet');
	if (submission.editToken !== token) throw error(403, 'Ugyldig token');
	if (submission.status !== 'submitted') throw error(403, 'Innlegget kan ikke redigeres');

	const [event] = await db
		.select()
		.from(events)
		.where(eq(events.arrangementId, submission.arrangementId));

	if (event?.submissionDeadline && new Date(event.submissionDeadline) < new Date()) {
		throw error(403, 'Fristen for redigering har gått ut');
	}

	const body = await request.json();
	const parsed = submissionUpdateSchema.safeParse(body.submission);
	if (!parsed.success) return json({ errors: parsed.error.flatten().fieldErrors }, { status: 400 });

	const [updated] = await db
		.update(submissions)
		.set({
			title: parsed.data.title,
			description: parsed.data.description,
			equipmentRequirements: parsed.data.equipmentRequirements || null,
			ageMin: parsed.data.ageMin,
			ageMax: parsed.data.ageMax,
			maxParticipants: parsed.data.maxParticipants,
			speakerName: parsed.data.speakerName,
			speakerEmail: parsed.data.speakerEmail,
			speakerBio: parsed.data.speakerBio
		})
		.where(eq(submissions.submissionId, params.submissionId))
		.returning();

	return json({ submission: updated });
}
