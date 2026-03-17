import { json, error } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { contactCards } from '$lib/server/db/schema';
import { validateSession } from '$lib/server/auth';
import { contactCardSchema } from '$lib/server/validation';
import { sql } from 'drizzle-orm';

export async function POST({ request, cookies }) {
	const adminUserId = await validateSession(cookies);
	if (!adminUserId) throw error(401, 'Ikke autorisert');

	const body = await request.json();
	const parsed = contactCardSchema.safeParse(body.contactCard);
	if (!parsed.success) return json({ errors: parsed.error.flatten().fieldErrors }, { status: 400 });

	const [maxRow] = await db
		.select({ max: sql<number>`coalesce(max(${contactCards.sortOrder}), -1)` })
		.from(contactCards);

	const [card] = await db
		.insert(contactCards)
		.values({
			title: parsed.data.title,
			actionType: parsed.data.actionType,
			actionValue: parsed.data.actionValue,
			sortOrder: maxRow.max + 1
		})
		.returning();

	return json({ contactCard: { id: card.contactCardId, ...card } });
}
