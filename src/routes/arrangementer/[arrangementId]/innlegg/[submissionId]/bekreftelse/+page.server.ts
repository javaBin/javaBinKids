import { db } from '$lib/server/db';
import { submissions, events } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { error } from '@sveltejs/kit';

export async function load({ params }) {
	const [submission] = await db
		.select()
		.from(submissions)
		.where(eq(submissions.submissionId, params.submissionId));

	if (!submission) throw error(404, 'Innlegg ikke funnet');

	const [event] = await db
		.select()
		.from(events)
		.where(eq(events.arrangementId, params.arrangementId));

	if (!event) throw error(404, 'Arrangement ikke funnet');

	const deadlineStr = event.submissionDeadline
		? new Date(event.submissionDeadline).toLocaleDateString('nb-NO', { day: 'numeric', month: 'long', year: 'numeric' })
		: '';

	return {
		title: submission.title,
		speakerEmail: submission.speakerEmail,
		eventTitle: event.title,
		arrangementId: params.arrangementId,
		deadlineStr
	};
}
