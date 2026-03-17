import { db } from '$lib/server/db';
import { contactCards } from '$lib/server/db/schema';
import { asc } from 'drizzle-orm';

export async function load() {
	const cards = await db
		.select()
		.from(contactCards)
		.orderBy(asc(contactCards.sortOrder));

	return { cards };
}
