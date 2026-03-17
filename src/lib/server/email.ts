import { Resend } from 'resend';

let resendInstance: Resend | null = null;
function getResend() {
	if (!resendInstance) {
		resendInstance = new Resend(process.env.RESEND_API_KEY);
	}
	return resendInstance;
}

const FROM_EMAIL = 'javaBin Kids <kids@javabin.no>';
const BASE_URL = process.env.BASE_URL || 'http://localhost:5175';

function emailLayout(content: string): string {
	return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /><meta name="viewport" content="width=device-width" /></head>
<body style="margin:0;padding:0;background-color:#0d1b2a;font-family:Arial,Helvetica,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0d1b2a;padding:40px 20px;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
	<tr><td style="text-align:center;padding:20px 0;">
		<span style="font-size:24px;font-weight:bold;color:#7ec8c8;">javaBin Kids</span>
	</td></tr>
	<tr><td style="background-color:#1a2f3a;border-radius:16px;padding:32px;border:1px solid rgba(255,255,255,0.1);">
		${content}
	</td></tr>
	<tr><td style="text-align:center;padding:20px 0;color:#a0b4c0;font-size:12px;">
		<a href="https://java.no" style="color:#a0b4c0;text-decoration:none;">javaBin</a> ·
		<a href="https://java.no/principles" style="color:#a0b4c0;text-decoration:none;">Code of Conduct</a>
	</td></tr>
</table>
</td></tr>
</table>
</body>
</html>`;
}

function heading(text: string): string {
	return `<h1 style="color:#7ec8c8;font-size:22px;margin:0 0 16px 0;">${text}</h1>`;
}

function paragraph(text: string): string {
	return `<p style="color:#e8e8e8;font-size:15px;line-height:1.6;margin:0 0 12px 0;">${text}</p>`;
}

function button(text: string, url: string): string {
	return `<p style="text-align:center;margin:24px 0 8px;"><a href="${url}" style="display:inline-block;background-color:#d4a843;color:#0d1b2a;font-weight:bold;font-size:15px;padding:12px 32px;border-radius:12px;text-decoration:none;">${text}</a></p>`;
}

function info(label: string, value: string): string {
	return `<tr><td style="color:#a0b4c0;padding:6px 0;font-size:14px;">${label}</td><td style="color:#e8e8e8;padding:6px 0;font-size:14px;text-align:right;font-weight:bold;">${value}</td></tr>`;
}

function infoTable(rows: string): string {
	return `<table width="100%" cellpadding="0" cellspacing="0" style="margin:16px 0;border-top:1px solid rgba(255,255,255,0.1);border-bottom:1px solid rgba(255,255,255,0.1);">${rows}</table>`;
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

	await getResend().emails.send({
		from: FROM_EMAIL,
		to: params.parentEmail,
		subject: `Påmelding bekreftet: ${params.courseTitle}`,
		html: emailLayout(`
			${heading(`Hei ${params.parentName}!`)}
			${paragraph(`<strong>${params.childName}</strong> er nå påmeldt <strong>${params.courseTitle}</strong>.`)}
			${infoTable(`
				${info('Arrangement', params.eventTitle)}
				${info('Dato', params.eventDate)}
				${info('Kurs', params.courseTitle)}
			`)}
			${button('Se bekreftelse', confirmUrl)}
			${paragraph(`<a href="${cancelUrl}" style="color:#a0b4c0;font-size:13px;">Avmeld</a>`)}
		`)
	});
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

	await getResend().emails.send({
		from: FROM_EMAIL,
		to: params.parentEmail,
		subject: `Venteliste: ${params.courseTitle}`,
		html: emailLayout(`
			${heading(`Hei ${params.parentName}!`)}
			${paragraph(`<strong>${params.childName}</strong> er satt på venteliste for <strong>${params.courseTitle}</strong>.`)}
			${paragraph(`Posisjon på venteliste: <strong style="color:#f0a830;">${params.position}</strong>`)}
			${paragraph('Du vil motta e-post dersom en plass blir ledig.')}
			${button('Se status', confirmUrl)}
			${paragraph(`<a href="${cancelUrl}" style="color:#a0b4c0;font-size:13px;">Avmeld</a>`)}
		`)
	});
}

export async function sendPromotionEmail(params: {
	parentEmail: string;
	parentName: string;
	childName: string;
	courseTitle: string;
	eventTitle: string;
	eventDate: string;
}) {
	await getResend().emails.send({
		from: FROM_EMAIL,
		to: params.parentEmail,
		subject: `Plass ledig: ${params.courseTitle}`,
		html: emailLayout(`
			${heading(`Gode nyheter, ${params.parentName}!`)}
			${paragraph(`En plass har blitt ledig, og <strong>${params.childName}</strong> er nå bekreftet påmeldt <strong>${params.courseTitle}</strong>.`)}
			${infoTable(`
				${info('Arrangement', params.eventTitle)}
				${info('Dato', params.eventDate)}
				${info('Kurs', params.courseTitle)}
			`)}
			${paragraph('Vi gleder oss til å se dere!')}
		`)
	});
}

export async function sendCancellationEmail(params: {
	parentEmail: string;
	parentName: string;
	childName: string;
	courseTitle: string;
}) {
	await getResend().emails.send({
		from: FROM_EMAIL,
		to: params.parentEmail,
		subject: `Avmelding bekreftet: ${params.courseTitle}`,
		html: emailLayout(`
			${heading(`Hei ${params.parentName}!`)}
			${paragraph(`Påmeldingen for <strong>${params.childName}</strong> til <strong>${params.courseTitle}</strong> er nå avbestilt.`)}
			${paragraph('Dersom dette var en feil, kan du melde deg på igjen via nettsiden.')}
		`)
	});
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
	await getResend().emails.send({
		from: FROM_EMAIL,
		to: params.parentEmail,
		subject: `Påminnelse: ${params.courseTitle} nærmer seg!`,
		html: emailLayout(`
			${heading(`Hei ${params.parentName}!`)}
			${paragraph(`Vi minner om at <strong>${params.childName}</strong> er påmeldt <strong>${params.courseTitle}</strong>.`)}
			${infoTable(`
				${info('Arrangement', params.eventTitle)}
				${info('Dato', params.eventDate)}
				${info('Sted', params.eventLocation)}
				${info('Kurs', params.courseTitle)}
			`)}
			${paragraph('Vi gleder oss til å se dere!')}
		`)
	});
}
