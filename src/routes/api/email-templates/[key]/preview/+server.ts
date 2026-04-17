import { json, error } from '@sveltejs/kit';
import { validateSession } from '$lib/server/auth';
import { isTemplateKey } from '$lib/server/emailTemplateService';
import { renderTemplatePreview } from '$lib/server/email';
import { z } from 'zod';

const previewSchema = z.object({
	subject: z.string().max(500),
	heading: z.string().max(500),
	introText: z.string().max(5000),
	outroText: z.string().max(5000),
	buttonText: z.string().max(200).nullable()
});

export async function POST({ params, request, cookies }) {
	const adminUserId = await validateSession(cookies);
	if (!adminUserId) throw error(401, 'Ikke autorisert');

	const key = params.key;
	if (!isTemplateKey(key)) throw error(404, 'Ukjent mal');

	const body = await request.json();
	const parsed = previewSchema.safeParse(body.fields);
	if (!parsed.success) {
		return json({ errors: parsed.error.flatten().fieldErrors }, { status: 400 });
	}

	const { subject, html } = await renderTemplatePreview(key, parsed.data);
	return json({ subject, html });
}
