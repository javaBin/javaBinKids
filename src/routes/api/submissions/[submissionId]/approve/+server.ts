import { json, error } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { submissions, events, courses } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { validateSession } from '$lib/server/auth';
import { sendSubmissionApprovedEmail } from '$lib/server/email';

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

	const [course] = await db
		.insert(courses)
		.values({
			arrangementId: submission.arrangementId,
			title: submission.title,
			introduction: '',
			description: submission.description,
			ageMin: submission.ageMin,
			ageMax: submission.ageMax,
			maxParticipants: submission.maxParticipants
		})
		.returning();

	await db
		.update(submissions)
		.set({ status: 'approved' })
		.where(eq(submissions.submissionId, params.submissionId));

	const eventDate = new Date(event.date).toLocaleDateString('nb-NO', {
		day: 'numeric', month: 'long', year: 'numeric'
	});

	sendSubmissionApprovedEmail({
		speakerEmail: submission.speakerEmail,
		speakerName: submission.speakerName,
		title: submission.title,
		eventTitle: event.title,
		eventDate
	}).catch(console.error);

	return json({ course: { courseId: course.courseId } });
}
