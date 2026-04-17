CREATE TABLE IF NOT EXISTS "emailTemplates" (
	"templateKey" text PRIMARY KEY NOT NULL,
	"subject" text DEFAULT '' NOT NULL,
	"heading" text DEFAULT '' NOT NULL,
	"introText" text DEFAULT '' NOT NULL,
	"outroText" text DEFAULT '' NOT NULL,
	"buttonText" text,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);

INSERT INTO "emailTemplates" ("templateKey", "subject", "heading", "introText", "outroText", "buttonText") VALUES
(
	'confirmation',
	'Påmelding bekreftet: {{courseTitle}}',
	'Hei {{parentName}}!',
	'**{{childName}}** er nå påmeldt **{{courseTitle}}**.',
	'',
	'Se bekreftelse'
),
(
	'waitlist',
	'Venteliste: {{courseTitle}}',
	'Hei {{parentName}}!',
	'**{{childName}}** er satt på venteliste for **{{courseTitle}}**.',
	'Du vil motta e-post dersom en plass blir ledig.',
	'Se status'
),
(
	'promotion',
	'Plass ledig: {{courseTitle}}',
	'Gode nyheter, {{parentName}}!',
	'En plass har blitt ledig, og **{{childName}}** er nå bekreftet påmeldt **{{courseTitle}}**.',
	'Vi gleder oss til å se dere!',
	NULL
),
(
	'cancellation',
	'Avmelding bekreftet: {{courseTitle}}',
	'Hei {{parentName}}!',
	'Påmeldingen for **{{childName}}** til **{{courseTitle}}** er nå avbestilt.',
	'Dersom dette var en feil, kan du melde deg på igjen via nettsiden.',
	NULL
),
(
	'reminder',
	'Påminnelse: {{courseTitle}} nærmer seg!',
	'Hei {{parentName}}!',
	'Vi minner om at **{{childName}}** er påmeldt **{{courseTitle}}**.',
	'Vi gleder oss til å se dere!',
	NULL
),
(
	'submissionReceived',
	'Forslag mottatt: {{title}}',
	'Hei {{speakerName}}!',
	E'Vi har mottatt forslaget ditt **{{title}}** til **{{eventTitle}}**.\n\nDu kan redigere forslaget ditt frem til **{{submissionDeadline}}**.',
	'Du vil få beskjed på e-post når forslaget er vurdert.',
	'Rediger forslaget'
),
(
	'submissionApproved',
	'Forslag godkjent: {{title}}',
	'Gratulerer, {{speakerName}}!',
	'Forslaget ditt **{{title}}** er godkjent og blir med på **{{eventTitle}}**.',
	'Vi gleder oss til å se deg!',
	NULL
),
(
	'submissionRejected',
	'Forslag ikke tatt med: {{title}}',
	'Hei {{speakerName}}',
	'Takk for forslaget ditt **{{title}}** til **{{eventTitle}}**.',
	'Dessverre har vi ikke mulighet til å ta med dette forslaget denne gangen. Vi håper du vil sende inn forslag igjen ved en senere anledning!',
	NULL
);
