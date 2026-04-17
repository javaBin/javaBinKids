import sgMail from '@sendgrid/mail';
import {
	getTemplate,
	renderInline,
	renderPlain,
	renderParagraphs,
	escapeHtml,
	TEMPLATE_VARIABLES,
	PREVIEW_VALUES,
	type TemplateKey,
	type EmailTemplateFields
} from './emailTemplateService';

let initialized = false;
function getSendGrid() {
	if (!initialized) {
		sgMail.setApiKey(process.env.SENDGRID_API_KEY!);
		initialized = true;
	}
	return sgMail;
}

async function sendEmail(params: { to: string; subject: string; html: string }) {
	const subjectPrefix = process.env.EMAIL_SUBJECT_PREFIX ?? '';
	await getSendGrid().send({
		from: FROM_EMAIL,
		to: params.to,
		subject: `${subjectPrefix}${params.subject}`,
		html: params.html
	});
}

const FROM_EMAIL = 'javaBin <kids@javabin.no>';
const BASE_URL = process.env.BASE_URL || 'http://localhost:5175';

function emailLayout(content: string): string {
	return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /><meta name="viewport" content="width=device-width" /></head>
<body style="margin:0;padding:0;background-color:#F5F5F5;font-family:Arial,Helvetica,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background-color:#F5F5F5;padding:40px 20px;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
	<tr><td style="background-color:#E74C3C;padding:32px 20px;text-align:center;border-radius:8px 8px 0 0;">
		<img src="${BASE_URL}/javabin-logo.png" alt="javaBin" style="max-width:200px;height:auto;display:inline-block;" />
	</td></tr>
	<tr><td style="background-color:#FFFFFF;padding:32px;border-radius:0 0 8px 8px;">
		${content}
	</td></tr>
	<tr><td style="text-align:center;padding:20px 0;color:#6C757D;font-size:12px;line-height:1.6;">
		JavaBin — Javabrukerforeningen i Norge<br />
		<a href="https://java.no" style="color:#6C757D;text-decoration:none;">java.no</a> ·
		<a href="https://javazone.no" style="color:#6C757D;text-decoration:none;">javazone.no</a>
	</td></tr>
</table>
</td></tr>
</table>
</body>
</html>`;
}

function heading(html: string): string {
	return `<h1 style="color:#E74C3C;font-size:20px;font-weight:bold;margin:0 0 16px 0;">${html}</h1>`;
}

function paragraph(html: string): string {
	return `<p style="color:#2D3748;font-size:15px;line-height:1.6;margin:0 0 12px 0;">${html}</p>`;
}

function button(text: string, url: string): string {
	return `<p style="text-align:center;margin:24px 0 8px;"><a href="${url}" style="display:inline-block;background-color:#E74C3C;color:#FFFFFF;font-weight:bold;font-size:15px;padding:12px 32px;border-radius:12px;text-decoration:none;">${text}</a></p>`;
}

function infoBox(label: string, value: string): string {
	return `<div style="background-color:#FBEEEE;padding:16px;border-radius:8px;margin:0 0 12px 0;">
		<div style="color:#6C757D;font-size:11px;font-weight:bold;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:4px;">${label}</div>
		<div style="color:#2D3748;font-size:16px;font-weight:bold;">${value}</div>
	</div>`;
}

function cancelLink(url: string): string {
	return `<p style="color:#2D3748;font-size:15px;line-height:1.6;margin:12px 0 0 0;"><a href="${url}" style="color:#6C757D;font-size:13px;">Avmeld</a></p>`;
}

type RenderOptions = {
	fields: EmailTemplateFields;
	vars: Record<string, string | number>;
	infoBoxes?: Array<{ label: string; value: string }>;
	buttonUrl?: string;
	cancelUrl?: string;
};

function renderHtml(opts: RenderOptions): { subject: string; html: string } {
	const subject = renderPlain(opts.fields.subject, opts.vars);

	const headingHtml = heading(renderInline(opts.fields.heading, opts.vars));
	const introHtml = renderParagraphs(opts.fields.introText, opts.vars, paragraph);
	const infoBoxesHtml = (opts.infoBoxes ?? [])
		.map(({ label, value }) => infoBox(escapeHtml(label), escapeHtml(value)))
		.join('');
	const buttonHtml =
		opts.buttonUrl && opts.fields.buttonText
			? button(renderInline(opts.fields.buttonText, opts.vars), opts.buttonUrl)
			: '';
	const outroHtml = renderParagraphs(opts.fields.outroText, opts.vars, paragraph);
	const cancelHtml = opts.cancelUrl ? cancelLink(opts.cancelUrl) : '';

	const content = headingHtml + introHtml + infoBoxesHtml + buttonHtml + outroHtml + cancelHtml;

	return { subject, html: emailLayout(content) };
}

export async function renderTemplatePreview(
	key: TemplateKey,
	fields: EmailTemplateFields
): Promise<{ subject: string; html: string }> {
	const allowedVars = TEMPLATE_VARIABLES[key];
	const vars: Record<string, string | number> = {};
	for (const name of allowedVars) {
		vars[name] = PREVIEW_VALUES[name] ?? `{{${name}}}`;
	}

	const infoBoxes = previewInfoBoxes(key, vars);
	const buttonUrl = fields.buttonText ? '#preview' : undefined;
	const cancelUrl = templateHasCancel(key) ? '#preview' : undefined;

	return renderHtml({ fields, vars, infoBoxes, buttonUrl, cancelUrl });
}

function previewInfoBoxes(
	key: TemplateKey,
	vars: Record<string, string | number>
): Array<{ label: string; value: string }> {
	switch (key) {
		case 'confirmation':
		case 'promotion':
		case 'submissionApproved':
			return [
				{ label: 'Arrangement', value: String(vars.eventTitle ?? '') },
				{ label: 'Dato', value: String(vars.eventDate ?? '') },
				{ label: 'Kurs', value: String(vars.courseTitle ?? vars.title ?? '') }
			];
		case 'waitlist':
			return [{ label: 'Posisjon på venteliste', value: String(vars.position ?? '') }];
		case 'reminder':
			return [
				{ label: 'Arrangement', value: String(vars.eventTitle ?? '') },
				{ label: 'Dato', value: String(vars.eventDate ?? '') },
				{ label: 'Sted', value: String(vars.eventLocation ?? '') },
				{ label: 'Kurs', value: String(vars.courseTitle ?? '') }
			];
		default:
			return [];
	}
}

function templateHasCancel(key: TemplateKey): boolean {
	return key === 'confirmation' || key === 'waitlist';
}

export async function sendConfirmationEmail(params: {
	parentEmail: string;
	parentName: string;
	childName: string;
	courseTitle: string;
	eventTitle: string;
	eventDate: string;
	registrationId: string;
	cancellationToken: string;
}) {
	const confirmUrl = `${BASE_URL}/bekreftelse/${params.registrationId}?token=${params.cancellationToken}`;
	const cancelUrl = `${BASE_URL}/avmelding/${params.registrationId}?token=${params.cancellationToken}`;

	const fields = await getTemplate('confirmation');
	const { subject, html } = renderHtml({
		fields,
		vars: {
			parentName: params.parentName,
			childName: params.childName,
			courseTitle: params.courseTitle,
			eventTitle: params.eventTitle,
			eventDate: params.eventDate
		},
		infoBoxes: [
			{ label: 'Arrangement', value: params.eventTitle },
			{ label: 'Dato', value: params.eventDate },
			{ label: 'Kurs', value: params.courseTitle }
		],
		buttonUrl: confirmUrl,
		cancelUrl
	});

	await sendEmail({ to: params.parentEmail, subject, html });
}

export async function sendWaitlistEmail(params: {
	parentEmail: string;
	parentName: string;
	childName: string;
	courseTitle: string;
	position: number;
	registrationId: string;
	cancellationToken: string;
}) {
	const confirmUrl = `${BASE_URL}/bekreftelse/${params.registrationId}?token=${params.cancellationToken}`;
	const cancelUrl = `${BASE_URL}/avmelding/${params.registrationId}?token=${params.cancellationToken}`;

	const fields = await getTemplate('waitlist');
	const { subject, html } = renderHtml({
		fields,
		vars: {
			parentName: params.parentName,
			childName: params.childName,
			courseTitle: params.courseTitle,
			position: params.position
		},
		infoBoxes: [{ label: 'Posisjon på venteliste', value: String(params.position) }],
		buttonUrl: confirmUrl,
		cancelUrl
	});

	await sendEmail({ to: params.parentEmail, subject, html });
}

export async function sendPromotionEmail(params: {
	parentEmail: string;
	parentName: string;
	childName: string;
	courseTitle: string;
	eventTitle: string;
	eventDate: string;
}) {
	const fields = await getTemplate('promotion');
	const { subject, html } = renderHtml({
		fields,
		vars: {
			parentName: params.parentName,
			childName: params.childName,
			courseTitle: params.courseTitle,
			eventTitle: params.eventTitle,
			eventDate: params.eventDate
		},
		infoBoxes: [
			{ label: 'Arrangement', value: params.eventTitle },
			{ label: 'Dato', value: params.eventDate },
			{ label: 'Kurs', value: params.courseTitle }
		]
	});

	await sendEmail({ to: params.parentEmail, subject, html });
}

export async function sendCancellationEmail(params: {
	parentEmail: string;
	parentName: string;
	childName: string;
	courseTitle: string;
}) {
	const fields = await getTemplate('cancellation');
	const { subject, html } = renderHtml({
		fields,
		vars: {
			parentName: params.parentName,
			childName: params.childName,
			courseTitle: params.courseTitle
		}
	});

	await sendEmail({ to: params.parentEmail, subject, html });
}

export async function sendReminderEmail(params: {
	parentEmail: string;
	parentName: string;
	childName: string;
	courseTitle: string;
	eventTitle: string;
	eventDate: string;
	eventLocation: string;
}) {
	const fields = await getTemplate('reminder');
	const { subject, html } = renderHtml({
		fields,
		vars: {
			parentName: params.parentName,
			childName: params.childName,
			courseTitle: params.courseTitle,
			eventTitle: params.eventTitle,
			eventDate: params.eventDate,
			eventLocation: params.eventLocation
		},
		infoBoxes: [
			{ label: 'Arrangement', value: params.eventTitle },
			{ label: 'Dato', value: params.eventDate },
			{ label: 'Sted', value: params.eventLocation },
			{ label: 'Kurs', value: params.courseTitle }
		]
	});

	await sendEmail({ to: params.parentEmail, subject, html });
}

export async function sendSubmissionReceivedEmail(params: {
	speakerEmail: string;
	speakerName: string;
	title: string;
	eventTitle: string;
	submissionId: string;
	editToken: string;
	submissionDeadline: string;
	arrangementId: string;
}) {
	const editUrl = `${BASE_URL}/arrangementer/${params.arrangementId}/innlegg/${params.submissionId}/rediger?token=${params.editToken}`;

	const fields = await getTemplate('submissionReceived');
	const { subject, html } = renderHtml({
		fields,
		vars: {
			speakerName: params.speakerName,
			title: params.title,
			eventTitle: params.eventTitle,
			submissionDeadline: params.submissionDeadline
		},
		buttonUrl: editUrl
	});

	await sendEmail({ to: params.speakerEmail, subject, html });
}

export async function sendSubmissionApprovedEmail(params: {
	speakerEmail: string;
	speakerName: string;
	title: string;
	eventTitle: string;
	eventDate: string;
}) {
	const fields = await getTemplate('submissionApproved');
	const { subject, html } = renderHtml({
		fields,
		vars: {
			speakerName: params.speakerName,
			title: params.title,
			eventTitle: params.eventTitle,
			eventDate: params.eventDate
		},
		infoBoxes: [
			{ label: 'Arrangement', value: params.eventTitle },
			{ label: 'Dato', value: params.eventDate },
			{ label: 'Kurs', value: params.title }
		]
	});

	await sendEmail({ to: params.speakerEmail, subject, html });
}

export async function sendSubmissionRejectedEmail(params: {
	speakerEmail: string;
	speakerName: string;
	title: string;
	eventTitle: string;
}) {
	const fields = await getTemplate('submissionRejected');
	const { subject, html } = renderHtml({
		fields,
		vars: {
			speakerName: params.speakerName,
			title: params.title,
			eventTitle: params.eventTitle
		}
	});

	await sendEmail({ to: params.speakerEmail, subject, html });
}
