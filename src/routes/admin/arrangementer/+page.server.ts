import { db } from '$lib/server/db';
import { events } from '$lib/server/db/schema';
import { desc } from 'drizzle-orm';

export async function load() {
	const allEvents = await db.select().from(events).orderBy(desc(events.date));
	return { events: allEvents };
}
