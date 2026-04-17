import { listTemplates } from '$lib/server/emailTemplateService';

export async function load() {
	const templates = await listTemplates();
	return { templates };
}
