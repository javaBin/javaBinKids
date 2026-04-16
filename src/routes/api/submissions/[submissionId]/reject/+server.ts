import { json, error } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { submissions, events } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { validateSession } from '$lib/server/auth';
import { sendSubmissionRejectedEmail } from '$lib/server/email';

export async function POST({ params, cookies }) {
	const adminUserId = await validateSession(cookies);
	if (!adminUserId) throw error(401, 'Ikke autorisert');

	const [submission] = await db
		.select()
		.from(submissions)
		.where(eq(submissions.submissionId, params.submissionId));

	if (!submission) throw error(404, 'Innlegg ikke funnet');
	if (submission.status !== 'submitted') throw error(400, 'Innlegget er allerede behandlet');

	const [event] = await db
		.select()
		.from(events)
		.where(eq(events.arrangementId, submission.arrangementId));

	if (!event) throw error(404, 'Arrangement ikke funnet');

	await db
		.update(submissions)
		.set({ status: 'rejected' })
		.where(eq(submissions.submissionId, params.submissionId));

	sendSubmissionRejectedEmail({
		speakerEmail: submission.speakerEmail,
		speakerName: submission.speakerName,
		title: submission.title,
		eventTitle: event.title
	}).catch(console.error);

	return json({ success: true });
}
