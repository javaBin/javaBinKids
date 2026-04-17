import { db } from '$lib/server/db';
import { emailTemplates } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

export type TemplateKey =
	| 'confirmation'
	| 'waitlist'
	| 'promotion'
	| 'cancellation'
	| 'reminder'
	| 'submissionReceived'
	| 'submissionApproved'
	| 'submissionRejected';

export const TEMPLATE_KEYS: TemplateKey[] = [
	'confirmation',
	'waitlist',
	'promotion',
	'cancellation',
	'reminder',
	'submissionReceived',
	'submissionApproved',
	'submissionRejected'
];

export type EmailTemplateFields = {
	subject: string;
	heading: string;
	introText: string;
	outroText: string;
	buttonText: string | null;
};

export const TEMPLATE_DEFAULTS: Record<TemplateKey, EmailTemplateFields> = {
	confirmation: {
		subject: 'Påmelding bekreftet: {{courseTitle}}',
		heading: 'Hei {{parentName}}!',
		introText: '**{{childName}}** er nå påmeldt **{{courseTitle}}**.',
		outroText: '',
		buttonText: 'Se bekreftelse'
	},
	waitlist: {
		subject: 'Venteliste: {{courseTitle}}',
		heading: 'Hei {{parentName}}!',
		introText: '**{{childName}}** er satt på venteliste for **{{courseTitle}}**.',
		outroText: 'Du vil motta e-post dersom en plass blir ledig.',
		buttonText: 'Se status'
	},
	promotion: {
		subject: 'Plass ledig: {{courseTitle}}',
		heading: 'Gode nyheter, {{parentName}}!',
		introText: 'En plass har blitt ledig, og **{{childName}}** er nå bekreftet påmeldt **{{courseTitle}}**.',
		outroText: 'Vi gleder oss til å se dere!',
		buttonText: null
	},
	cancellation: {
		subject: 'Avmelding bekreftet: {{courseTitle}}',
		heading: 'Hei {{parentName}}!',
		introText: 'Påmeldingen for **{{childName}}** til **{{courseTitle}}** er nå avbestilt.',
		outroText: 'Dersom dette var en feil, kan du melde deg på igjen via nettsiden.',
		buttonText: null
	},
	reminder: {
		subject: 'Påminnelse: {{courseTitle}} nærmer seg!',
		heading: 'Hei {{parentName}}!',
		introText: 'Vi minner om at **{{childName}}** er påmeldt **{{courseTitle}}**.',
		outroText: 'Vi gleder oss til å se dere!',
		buttonText: null
	},
	submissionReceived: {
		subject: 'Forslag mottatt: {{title}}',
		heading: 'Hei {{speakerName}}!',
		introText:
			'Vi har mottatt forslaget ditt **{{title}}** til **{{eventTitle}}**.\n\nDu kan redigere forslaget ditt frem til **{{submissionDeadline}}**.',
		outroText: 'Du vil få beskjed på e-post når forslaget er vurdert.',
		buttonText: 'Rediger forslaget'
	},
	submissionApproved: {
		subject: 'Forslag godkjent: {{title}}',
		heading: 'Gratulerer, {{speakerName}}!',
		introText: 'Forslaget ditt **{{title}}** er godkjent og blir med på **{{eventTitle}}**.',
		outroText: 'Vi gleder oss til å se deg!',
		buttonText: null
	},
	submissionRejected: {
		subject: 'Forslag ikke tatt med: {{title}}',
		heading: 'Hei {{speakerName}}',
		introText: 'Takk for forslaget ditt **{{title}}** til **{{eventTitle}}**.',
		outroText:
			'Dessverre har vi ikke mulighet til å ta med dette forslaget denne gangen. Vi håper du vil sende inn forslag igjen ved en senere anledning!',
		buttonText: null
	}
};

export const TEMPLATE_LABELS: Record<TemplateKey, string> = {
	confirmation: 'Bekreftelse på påmelding',
	waitlist: 'Satt på venteliste',
	promotion: 'Flyttet fra venteliste til plass',
	cancellation: 'Avmelding bekreftet',
	reminder: 'Påminnelse før arrangement',
	submissionReceived: 'Forslag mottatt',
	submissionApproved: 'Forslag godkjent',
	submissionRejected: 'Forslag ikke tatt med'
};

export const TEMPLATE_VARIABLES: Record<TemplateKey, string[]> = {
	confirmation: ['parentName', 'childName', 'courseTitle', 'eventTitle', 'eventDate'],
	waitlist: ['parentName', 'childName', 'courseTitle', 'position'],
	promotion: ['parentName', 'childName', 'courseTitle', 'eventTitle', 'eventDate'],
	cancellation: ['parentName', 'childName', 'courseTitle'],
	reminder: ['parentName', 'childName', 'courseTitle', 'eventTitle', 'eventDate', 'eventLocation'],
	submissionReceived: ['speakerName', 'title', 'eventTitle', 'submissionDeadline'],
	submissionApproved: ['speakerName', 'title', 'eventTitle', 'eventDate'],
	submissionRejected: ['speakerName', 'title', 'eventTitle']
};

export const PREVIEW_VALUES: Record<string, string> = {
	parentName: 'Ola Nordmann',
	childName: 'Kari Nordmann',
	courseTitle: 'Arduino for nybegynnere',
	eventTitle: 'javaBin Kids Vår 2026',
	eventDate: 'lørdag 30. mai 2026',
	eventLocation: 'Rebel, Universitetsgata 2',
	position: '3',
	speakerName: 'Ola Nordmann',
	title: 'Introduksjon til Arduino',
	submissionDeadline: '1. mai 2026'
};

export function isTemplateKey(key: string): key is TemplateKey {
	return (TEMPLATE_KEYS as string[]).includes(key);
}

export async function getTemplate(key: TemplateKey): Promise<EmailTemplateFields> {
	const [row] = await db
		.select()
		.from(emailTemplates)
		.where(eq(emailTemplates.templateKey, key));

	const defaults = TEMPLATE_DEFAULTS[key];
	if (!row) return defaults;

	return {
		subject: row.subject || defaults.subject,
		heading: row.heading || defaults.heading,
		introText: row.introText || defaults.introText,
		outroText: row.outroText || defaults.outroText,
		buttonText: row.buttonText ?? defaults.buttonText
	};
}

export async function listTemplates() {
	const rows = await db.select().from(emailTemplates);
	const byKey = new Map(rows.map((r) => [r.templateKey, r]));
	return TEMPLATE_KEYS.map((key) => {
		const row = byKey.get(key);
		const defaults = TEMPLATE_DEFAULTS[key];
		return {
			templateKey: key,
			label: TEMPLATE_LABELS[key],
			subject: row?.subject || defaults.subject,
			heading: row?.heading || defaults.heading,
			introText: row?.introText || defaults.introText,
			outroText: row?.outroText || defaults.outroText,
			buttonText: row?.buttonText ?? defaults.buttonText,
			updatedAt: row?.updatedAt ?? null
		};
	});
}

export async function updateTemplate(
	key: TemplateKey,
	patch: { subject: string; heading: string; introText: string; outroText: string; buttonText: string | null }
): Promise<EmailTemplateFields> {
	await db
		.insert(emailTemplates)
		.values({
			templateKey: key,
			subject: patch.subject,
			heading: patch.heading,
			introText: patch.introText,
			outroText: patch.outroText,
			buttonText: patch.buttonText
		})
		.onConflictDoUpdate({
			target: emailTemplates.templateKey,
			set: {
				subject: patch.subject,
				heading: patch.heading,
				introText: patch.introText,
				outroText: patch.outroText,
				buttonText: patch.buttonText,
				updatedAt: new Date()
			}
		});

	return getTemplate(key);
}

export function escapeHtml(text: string): string {
	return text
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#39;');
}

export function applyVariables(template: string, vars: Record<string, string | number>): string {
	return template.replace(/\{\{\s*(\w+)\s*\}\}/g, (match, name: string) => {
		if (name in vars) return escapeHtml(String(vars[name]));
		return match;
	});
}

export function renderInline(template: string, vars: Record<string, string | number>): string {
	const escaped = escapeHtml(template);
	const withVars = escaped.replace(/\{\{\s*(\w+)\s*\}\}/g, (match, name: string) => {
		if (name in vars) return escapeHtml(String(vars[name]));
		return match;
	});
	return withVars.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
}

export function renderPlain(template: string, vars: Record<string, string | number>): string {
	return template.replace(/\{\{\s*(\w+)\s*\}\}/g, (match, name: string) => {
		if (name in vars) return String(vars[name]);
		return match;
	});
}

export function renderParagraphs(
	template: string,
	vars: Record<string, string | number>,
	wrap: (html: string) => string
): string {
	if (!template.trim()) return '';
	const blocks = template.split(/\n\s*\n/);
	return blocks
		.map((block) => renderInline(block.trim(), vars))
		.filter((html) => html.length > 0)
		.map(wrap)
		.join('');
}
