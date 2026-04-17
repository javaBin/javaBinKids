import { json, error } from '@sveltejs/kit';
import { validateSession } from '$lib/server/auth';
import {
	getTemplate,
	updateTemplate,
	isTemplateKey,
	TEMPLATE_LABELS,
	TEMPLATE_VARIABLES
} from '$lib/server/emailTemplateService';
import { z } from 'zod';

const patchSchema = z.object({
	subject: z.string().max(500),
	heading: z.string().max(500),
	introText: z.string().max(5000),
	outroText: z.string().max(5000),
	buttonText: z.string().max(200).nullable()
});

export async function GET({ params, cookies }) {
	const adminUserId = await validateSession(cookies);
	if (!adminUserId) throw error(401, 'Ikke autorisert');

	const key = params.key;
	if (!isTemplateKey(key)) throw error(404, 'Ukjent mal');

	const fields = await getTemplate(key);
	return json({
		template: {
			templateKey: key,
			label: TEMPLATE_LABELS[key],
			variables: TEMPLATE_VARIABLES[key],
			...fields
		}
	});
}

export async function PUT({ params, request, cookies }) {
	const adminUserId = await validateSession(cookies);
	if (!adminUserId) throw error(401, 'Ikke autorisert');

	const key = params.key;
	if (!isTemplateKey(key)) throw error(404, 'Ukjent mal');

	const body = await request.json();
	const parsed = patchSchema.safeParse(body.template);
	if (!parsed.success) {
		return json({ errors: parsed.error.flatten().fieldErrors }, { status: 400 });
	}

	const fields = await updateTemplate(key, parsed.data);
	return json({ template: { templateKey: key, ...fields } });
}
