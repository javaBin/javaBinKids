import { error } from '@sveltejs/kit';
import {
	getTemplate,
	isTemplateKey,
	TEMPLATE_LABELS,
	TEMPLATE_VARIABLES,
	TEMPLATE_DEFAULTS
} from '$lib/server/emailTemplateService';

export async function load({ params }) {
	if (!isTemplateKey(params.key)) throw error(404, 'Ukjent mal');

	const fields = await getTemplate(params.key);
	return {
		templateKey: params.key,
		label: TEMPLATE_LABELS[params.key],
		variables: TEMPLATE_VARIABLES[params.key],
		defaults: TEMPLATE_DEFAULTS[params.key],
		fields
	};
}
