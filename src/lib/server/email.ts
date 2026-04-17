import sgMail from '@sendgrid/mail';

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

function heading(text: string): string {
	return `<h1 style="color:#E74C3C;font-size:20px;font-weight:bold;margin:0 0 16px 0;">${text}</h1>`;
}

function paragraph(text: string): string {
	return `<p style="color:#2D3748;font-size:15px;line-height:1.6;margin:0 0 12px 0;">${text}</p>`;
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

	await sendEmail({
		to: params.parentEmail,
		subject: `Påmelding bekreftet: ${params.courseTitle}`,
		html: emailLayout(`
			${heading(`Hei ${params.parentName}!`)}
			${paragraph(`<strong>${params.childName}</strong> er nå påmeldt <strong>${params.courseTitle}</strong>.`)}
			${infoBox('Arrangement', params.eventTitle)}
			${infoBox('Dato', params.eventDate)}
			${infoBox('Kurs', params.courseTitle)}
			${button('Se bekreftelse', confirmUrl)}
			${paragraph(`<a href="${cancelUrl}" style="color:#6C757D;font-size:13px;">Avmeld</a>`)}
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

	await sendEmail({
		to: params.parentEmail,
		subject: `Venteliste: ${params.courseTitle}`,
		html: emailLayout(`
			${heading(`Hei ${params.parentName}!`)}
			${paragraph(`<strong>${params.childName}</strong> er satt på venteliste for <strong>${params.courseTitle}</strong>.`)}
			${infoBox('Posisjon på venteliste', String(params.position))}
			${paragraph('Du vil motta e-post dersom en plass blir ledig.')}
			${button('Se status', confirmUrl)}
			${paragraph(`<a href="${cancelUrl}" style="color:#6C757D;font-size:13px;">Avmeld</a>`)}
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
	await sendEmail({
		to: params.parentEmail,
		subject: `Plass ledig: ${params.courseTitle}`,
		html: emailLayout(`
			${heading(`Gode nyheter, ${params.parentName}!`)}
			${paragraph(`En plass har blitt ledig, og <strong>${params.childName}</strong> er nå bekreftet påmeldt <strong>${params.courseTitle}</strong>.`)}
			${infoBox('Arrangement', params.eventTitle)}
			${infoBox('Dato', params.eventDate)}
			${infoBox('Kurs', params.courseTitle)}
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
	await sendEmail({
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
	await sendEmail({
		to: params.parentEmail,
		subject: `Påminnelse: ${params.courseTitle} nærmer seg!`,
		html: emailLayout(`
			${heading(`Hei ${params.parentName}!`)}
			${paragraph(`Vi minner om at <strong>${params.childName}</strong> er påmeldt <strong>${params.courseTitle}</strong>.`)}
			${infoBox('Arrangement', params.eventTitle)}
			${infoBox('Dato', params.eventDate)}
			${infoBox('Sted', params.eventLocation)}
			${infoBox('Kurs', params.courseTitle)}
			${paragraph('Vi gleder oss til å se dere!')}
		`)
	});
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

	await sendEmail({
		to: params.speakerEmail,
		subject: `Forslag mottatt: ${params.title}`,
		html: emailLayout(`
			${heading(`Hei ${params.speakerName}!`)}
			${paragraph(`Vi har mottatt forslaget ditt <strong>${params.title}</strong> til <strong>${params.eventTitle}</strong>.`)}
			${paragraph(`Du kan redigere forslaget ditt frem til <strong>${params.submissionDeadline}</strong>.`)}
			${button('Rediger forslaget', editUrl)}
			${paragraph('Du vil få beskjed på e-post når forslaget er vurdert.')}
		`)
	});
}

export async function sendSubmissionApprovedEmail(params: {
	speakerEmail: string;
	speakerName: string;
	title: string;
	eventTitle: string;
	eventDate: string;
}) {
	await sendEmail({
		to: params.speakerEmail,
		subject: `Forslag godkjent: ${params.title}`,
		html: emailLayout(`
			${heading(`Gratulerer, ${params.speakerName}!`)}
			${paragraph(`Forslaget ditt <strong>${params.title}</strong> er godkjent og blir med på <strong>${params.eventTitle}</strong>.`)}
			${infoBox('Arrangement', params.eventTitle)}
			${infoBox('Dato', params.eventDate)}
			${infoBox('Kurs', params.title)}
			${paragraph('Vi gleder oss til å se deg!')}
		`)
	});
}

export async function sendSubmissionRejectedEmail(params: {
	speakerEmail: string;
	speakerName: string;
	title: string;
	eventTitle: string;
}) {
	await sendEmail({
		to: params.speakerEmail,
		subject: `Forslag ikke tatt med: ${params.title}`,
		html: emailLayout(`
			${heading(`Hei ${params.speakerName}`)}
			${paragraph(`Takk for forslaget ditt <strong>${params.title}</strong> til <strong>${params.eventTitle}</strong>.`)}
			${paragraph('Dessverre har vi ikke mulighet til å ta med dette forslaget denne gangen. Vi håper du vil sende inn forslag igjen ved en senere anledning!')}
		`)
	});
}
