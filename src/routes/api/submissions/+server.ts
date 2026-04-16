import { json, error } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { events, submissions } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { submissionSchema } from '$lib/server/validation';
import { sendSubmissionReceivedEmail } from '$lib/server/email';

export async function POST({ request }) {
	const body = await request.json();
	const parsed = submissionSchema.safeParse(body.submission);
	if (!parsed.success) return json({ errors: parsed.error.flatten().fieldErrors }, { status: 400 });

	const [event] = await db
		.select()
		.from(events)
		.where(eq(events.arrangementId, parsed.data.arrangementId));

	if (!event) throw error(404, 'Arrangement ikke funnet');
	if (!event.openForSubmissions) throw error(403, 'Arrangementet tar ikke imot innlegg');
	if (event.submissionDeadline && new Date(event.submissionDeadline) < new Date()) {
		throw error(403, 'Fristen for innlegg har gått ut');
	}

	const [submission] = await db
		.insert(submissions)
		.values({
			arrangementId: parsed.data.arrangementId,
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
		.returning();

	const deadlineStr = event.submissionDeadline
		? new Date(event.submissionDeadline).toLocaleDateString('nb-NO', { day: 'numeric', month: 'long', year: 'numeric' })
		: '';

	sendSubmissionReceivedEmail({
		speakerEmail: submission.speakerEmail,
		speakerName: submission.speakerName,
		title: submission.title,
		eventTitle: event.title,
		submissionId: submission.submissionId,
		editToken: submission.editToken,
		submissionDeadline: deadlineStr,
		arrangementId: event.arrangementId
	}).catch(console.error);

	return json({ submission: { submissionId: submission.submissionId } });
}
