import { db } from '$lib/server/db';
import { events } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { error } from '@sveltejs/kit';

export async function load({ params }) {
	const [event] = await db
		.select()
		.from(events)
		.where(eq(events.arrangementId, params.arrangementId));

	if (!event) throw error(404, 'Arrangement ikke funnet');
	if (!event.openForSubmissions) throw error(403, 'Arrangementet tar ikke imot innlegg');
	if (event.submissionDeadline && new Date(event.submissionDeadline) < new Date()) {
		throw error(403, 'Fristen for innlegg har gått ut');
	}

	return { event };
}
