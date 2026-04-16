import { z } from 'zod';

export const registrationSchema = z.object({
	parentName: z.string().min(1, 'Navn er påkrevd'),
	parentEmail: z.string().email('Ugyldig e-postadresse'),
	parentPhone: z.string().min(8, 'Ugyldig telefonnummer'),
	childName: z.string().min(1, 'Barnets navn er påkrevd'),
	childAge: z.number().int().min(3, 'Minimum alder er 3').max(18, 'Maksimum alder er 18')
});

export const eventSchema = z.object({
	title: z.string().min(1, 'Tittel er påkrevd'),
	description: z.string().min(1, 'Beskrivelse er påkrevd'),
	date: z.string().datetime(),
	location: z.string().min(1, 'Sted er påkrevd'),
	registrationOpens: z.string().datetime(),
	registrationCloses: z.string().datetime(),
	imageUrl: z.string().url().optional()
});

export const courseSchema = z.object({
	arrangementId: z.string().uuid(),
	title: z.string().min(1, 'Tittel er påkrevd'),
	introduction: z.string().default(''),
	description: z.string().min(1, 'Innhold er påkrevd'),
	thumbnailUrl: z.string().url().optional().or(z.literal('')),
	ageMin: z.number().int().min(3),
	ageMax: z.number().int().max(18),
	maxParticipants: z.number().int().min(1)
});

export const submissionSchema = z.object({
	arrangementId: z.string().uuid(),
	speakerName: z.string().min(1, 'Navn er påkrevd'),
	speakerEmail: z.string().email('Ugyldig e-postadresse'),
	speakerBio: z.string().min(1, 'Bio er påkrevd'),
	title: z.string().min(1, 'Tittel er påkrevd'),
	description: z.string().min(1, 'Beskrivelse er påkrevd'),
	equipmentRequirements: z.string().optional(),
	ageMin: z.number().int().min(3),
	ageMax: z.number().int().max(18),
	maxParticipants: z.number().int().min(1)
});

export const submissionUpdateSchema = submissionSchema.omit({ arrangementId: true });

export type SubmissionInput = z.infer<typeof submissionSchema>;
export type SubmissionUpdateInput = z.infer<typeof submissionUpdateSchema>;

export const loginSchema = z.object({
	username: z.string().min(1, 'Brukernavn er påkrevd'),
	password: z.string().min(1, 'Passord er påkrevd')
});

export const siteContentSchema = z.object({
	key: z.string().min(1),
	content: z.string()
});

export const contactCardSchema = z.object({
	title: z.string().min(1, 'Tittel er påkrevd'),
	actionType: z.enum(['email', 'link', 'phone']),
	actionValue: z.string().min(1, 'Verdi er påkrevd')
});

export type RegistrationInput = z.infer<typeof registrationSchema>;
export type EventInput = z.infer<typeof eventSchema>;
export type CourseInput = z.infer<typeof courseSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type SiteContentInput = z.infer<typeof siteContentSchema>;
export type ContactCardInput = z.infer<typeof contactCardSchema>;
