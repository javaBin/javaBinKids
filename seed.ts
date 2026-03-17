import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import { hash } from 'bcrypt';
import * as schema from './src/lib/server/db/schema';

const client = postgres(process.env.DATABASE_URL!);
const db = drizzle(client, { schema, casing: 'camelCase' });

async function seed() {
	const username = process.env.ADMIN_USERNAME || 'admin';
	const password = process.env.ADMIN_PASSWORD || 'changeme';
	const passwordHash = await hash(password, 10);

	await db.insert(schema.adminUsers).values({
		username,
		passwordHash
	}).onConflictDoNothing();

	// Sample event
	const [event] = await db.insert(schema.events).values({
		title: 'javaBin Kids Høst 2026',
		description: 'En kveld med koding og robotprogrammering for barn! Vi har aktiviteter tilpasset ulike aldersgrupper.',
		date: new Date('2026-09-04T17:00:00'),
		location: 'NOVA Spektrum, Lillestrøm',
		registrationOpens: new Date('2026-06-01T00:00:00'),
		registrationCloses: new Date('2026-09-03T23:59:59')
	}).returning();

	await db.insert(schema.courses).values([
		{
			arrangementId: event.arrangementId,
			title: 'Scratch for nybegynnere',
			description: 'Lær å programmere med Scratch! Lag ditt eget spill med blokk-programmering.',
			ageMin: 6,
			ageMax: 9,
			maxParticipants: 20
		},
		{
			arrangementId: event.arrangementId,
			title: 'Robotprogrammering med micro:bit',
			description: 'Programmer micro:bit til å styre roboter! Lær om sensorer og motorer.',
			ageMin: 8,
			ageMax: 12,
			maxParticipants: 15
		},
		{
			arrangementId: event.arrangementId,
			title: 'Webutvikling med HTML og CSS',
			description: 'Lag din egen nettside fra bunnen av. Lær grunnleggende HTML og CSS.',
			ageMin: 10,
			ageMax: 14,
			maxParticipants: 20
		}
	]);

	console.log('Seed completed successfully');
	await client.end();
}

seed().catch(console.error);
