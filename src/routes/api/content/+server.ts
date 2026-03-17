import { json, error } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { siteContent } from '$lib/server/db/schema';
import { validateSession } from '$lib/server/auth';
import { siteContentSchema } from '$lib/server/validation';

export async function PUT({ request, cookies }) {
	const adminUserId = await validateSession(cookies);
	if (!adminUserId) throw error(401, 'Ikke autorisert');

	const body = await request.json();
	const parsed = siteContentSchema.safeParse(body.content);
	if (!parsed.success) return json({ errors: parsed.error.flatten().fieldErrors }, { status: 400 });

	const [row] = await db
		.insert(siteContent)
		.values({ key: parsed.data.key, content: parsed.data.content })
		.onConflictDoUpdate({
			target: siteContent.key,
			set: { content: parsed.data.content }
		})
		.returning();

	return json({ content: { id: row.key, ...row } });
}
