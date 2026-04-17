import { pgTable, uuid, text, timestamp, integer, boolean, unique, customType } from 'drizzle-orm/pg-core';

const bytea = customType<{ data: Buffer; driverData: Buffer }>({
	dataType() {
		return 'bytea';
	}
});

export const events = pgTable('events', {
	arrangementId: uuid().primaryKey().defaultRandom(),
	title: text().notNull(),
	description: text().notNull(),
	date: timestamp().notNull(),
	location: text().notNull(),
	cancelled: boolean().notNull().default(false),
	registrationOpens: timestamp().notNull(),
	registrationCloses: timestamp().notNull(),
	imageUrl: text(),
	openForSubmissions: boolean().notNull().default(false),
	submissionDeadline: timestamp(),
	createdAt: timestamp().notNull().defaultNow(),
	updatedAt: timestamp().notNull().defaultNow().$onUpdate(() => new Date())
});

export const courses = pgTable('courses', {
	courseId: uuid().primaryKey().defaultRandom(),
	arrangementId: uuid().notNull().references(() => events.arrangementId, { onDelete: 'restrict' }),
	title: text().notNull(),
	introduction: text().notNull().default(''),
	description: text().notNull(),
	thumbnailUrl: text(),
	ageMin: integer().notNull(),
	ageMax: integer().notNull(),
	maxParticipants: integer().notNull(),
	createdAt: timestamp().notNull().defaultNow(),
	updatedAt: timestamp().notNull().defaultNow().$onUpdate(() => new Date())
});

export const submissions = pgTable('submissions', {
	submissionId: uuid().primaryKey().defaultRandom(),
	arrangementId: uuid().notNull().references(() => events.arrangementId, { onDelete: 'restrict' }),
	status: text().notNull().default('submitted'),
	title: text().notNull(),
	description: text().notNull(),
	equipmentRequirements: text(),
	ageMin: integer().notNull(),
	ageMax: integer().notNull(),
	maxParticipants: integer().notNull(),
	speakerName: text().notNull(),
	speakerEmail: text().notNull(),
	speakerBio: text().notNull(),
	editToken: uuid().notNull().defaultRandom(),
	createdAt: timestamp().notNull().defaultNow(),
	updatedAt: timestamp().notNull().defaultNow().$onUpdate(() => new Date())
});

export const registrations = pgTable('registrations', (t) => ({
	registrationId: uuid().primaryKey().defaultRandom(),
	courseId: uuid().notNull().references(() => courses.courseId),
	parentName: text().notNull(),
	parentEmail: text().notNull(),
	parentPhone: text().notNull(),
	childName: text().notNull(),
	childAge: integer().notNull(),
	status: text().notNull().default('confirmed'),
	waitlistPosition: integer(),
	consentGiven: boolean().notNull().default(false),
	cancellationToken: uuid().notNull().defaultRandom(),
	createdAt: timestamp().notNull().defaultNow(),
	updatedAt: timestamp().notNull().defaultNow().$onUpdate(() => new Date())
}), (table) => [
	unique().on(table.courseId, table.parentEmail, table.childName)
]);

export const adminUsers = pgTable('adminUsers', {
	adminUserId: uuid().primaryKey().defaultRandom(),
	username: text().notNull().unique(),
	passwordHash: text().notNull(),
	createdAt: timestamp().notNull().defaultNow()
});

export const sessions = pgTable('sessions', {
	sessionId: uuid().primaryKey().defaultRandom(),
	adminUserId: uuid().notNull().references(() => adminUsers.adminUserId),
	expiresAt: timestamp().notNull(),
	createdAt: timestamp().notNull().defaultNow()
});

export const siteContent = pgTable('siteContent', {
	key: text().primaryKey(),
	content: text().notNull().default(''),
	updatedAt: timestamp().notNull().defaultNow().$onUpdate(() => new Date())
});

export const images = pgTable('images', {
	imageId: uuid().primaryKey().defaultRandom(),
	filename: text().notNull(),
	mimeType: text().notNull(),
	data: bytea().notNull(),
	createdAt: timestamp().notNull().defaultNow()
});

export const emailTemplates = pgTable('emailTemplates', {
	templateKey: text().primaryKey(),
	subject: text().notNull().default(''),
	heading: text().notNull().default(''),
	introText: text().notNull().default(''),
	outroText: text().notNull().default(''),
	buttonText: text(),
	updatedAt: timestamp().notNull().defaultNow().$onUpdate(() => new Date())
});

export const contactCards = pgTable('contactCards', {
	contactCardId: uuid().primaryKey().defaultRandom(),
	title: text().notNull(),
	actionType: text().notNull(),
	actionValue: text().notNull(),
	sortOrder: integer().notNull().default(0),
	createdAt: timestamp().notNull().defaultNow(),
	updatedAt: timestamp().notNull().defaultNow().$onUpdate(() => new Date())
});
