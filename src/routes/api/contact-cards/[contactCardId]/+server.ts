import { json, error } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { contactCards } from '$lib/server/db/schema';
import { validateSession } from '$lib/server/auth';
import { contactCardSchema } from '$lib/server/validation';
import { eq } from 'drizzle-orm';

export async function PATCH({ request, cookies, params }) {
	const adminUserId = await validateSession(cookies);
	if (!adminUserId) throw error(401, 'Ikke autorisert');

	const body = await request.json();
	const parsed = contactCardSchema.safeParse(body.contactCard);
	if (!parsed.success) return json({ errors: parsed.error.flatten().fieldErrors }, { status: 400 });

	const [card] = await db
		.update(contactCards)
		.set({
			title: parsed.data.title,
			actionType: parsed.data.actionType,
			actionValue: parsed.data.actionValue
		})
		.where(eq(contactCards.contactCardId, params.contactCardId))
		.returning();

	return json({ contactCard: { id: card.contactCardId, ...card } });
}

export async function DELETE({ cookies, params }) {
	const adminUserId = await validateSession(cookies);
	if (!adminUserId) throw error(401, 'Ikke autorisert');

	await db.delete(contactCards).where(eq(contactCards.contactCardId, params.contactCardId));
	return new Response(null, { status: 200 });
}
