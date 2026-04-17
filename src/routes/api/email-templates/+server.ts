import { json, error } from '@sveltejs/kit';
import { validateSession } from '$lib/server/auth';
import { listTemplates } from '$lib/server/emailTemplateService';

export async function GET({ cookies }) {
	const adminUserId = await validateSession(cookies);
	if (!adminUserId) throw error(401, 'Ikke autorisert');

	const templates = await listTemplates();
	return json({ templates });
}
