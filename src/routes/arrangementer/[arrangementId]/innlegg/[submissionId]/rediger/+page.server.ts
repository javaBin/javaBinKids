import { db } from '$lib/server/db';
import { submissions, events } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { error } from '@sveltejs/kit';

export async function load({ params, url }) {
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
		.where(eq(events.arrangementId, params.arrangementId));

	if (!event) throw error(404, 'Arrangement ikke funnet');

	if (event.submissionDeadline && new Date(event.submissionDeadline) < new Date()) {
		throw error(403, 'Fristen for redigering har gått ut');
	}

	return { event, submission, editToken: token };
}
