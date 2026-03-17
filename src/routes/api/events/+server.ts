import { json, error } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { events } from '$lib/server/db/schema';
import { validateSession } from '$lib/server/auth';
import { eventSchema } from '$lib/server/validation';

export async function POST({ request, cookies }) {
	const adminUserId = await validateSession(cookies);
	if (!adminUserId) throw error(401, 'Ikke autorisert');

	const body = await request.json();
	const parsed = eventSchema.safeParse(body.event);
	if (!parsed.success) return json({ errors: parsed.error.flatten().fieldErrors }, { status: 400 });

	const [event] = await db
		.insert(events)
		.values({
			title: parsed.data.title,
			description: parsed.data.description,
			date: new Date(parsed.data.date),
			location: parsed.data.location,
			registrationOpens: new Date(parsed.data.registrationOpens),
			registrationCloses: new Date(parsed.data.registrationCloses),
			imageUrl: parsed.data.imageUrl
		})
		.returning();

	return json({ event: { id: event.arrangementId, ...event } });
}
