import { db } from './index';
import { siteContent, contactCards, adminUsers } from './schema';
import { hash } from 'bcrypt';

async function seed() {
	const username = process.env.ADMIN_USERNAME || 'admin';
	const password = process.env.ADMIN_PASSWORD || 'changeme';
	const passwordHash = await hash(password, 10);

	await db
		.insert(adminUsers)
		.values({ username, passwordHash })
		.onConflictDoNothing();

	console.log(`Admin user "${username}" seeded.`);
	await db
		.insert(siteContent)
		.values([
			{
				key: 'hero_title',
				content: 'javaBin Kids'
			},
			{
				key: 'hero_subtitle',
				content: 'Kode-arrangementer for barn i regi av javaBin'
			},
			{
				key: 'hero_text',
				content: 'javaBin Kids arrangerer kvelder med koding, robotprogrammering og andre morsomme aktiviteter for barn i ulike aldersgrupper!'
			},
			{
				key: 'om_title',
				content: 'Om javaBin Kids'
			},
			{
				key: 'om_content',
				content: `## Hva er javaBin Kids?

javaBin Kids er kode-arrangementer for barn, organisert av javaBin — Norges største Java-brukergruppe. Vi arrangerer kvelder med koding, robotprogrammering og andre morsomme aktiviteter i forbindelse med JavaZone-konferansen.

## Hvem er det for?

Arrangementene er rettet mot barn i alderen 6–14 år. Hvert kurs har sin egen aldersgruppe, slik at innholdet er tilpasset deltakernes nivå. Ingen forkunnskaper er nødvendig!

## Hva skjer på en kveld?

En typisk kveld har flere parallelle kurs og aktiviteter. Barna kan velge mellom blant annet Scratch-programmering, roboter med micro:bit, webutvikling med HTML og CSS, og mer. Erfarne frivillige veileder barna gjennom kveldens aktiviteter.

## Om javaBin

javaBin er Norges Java User Group (JUG) og arrangerer JavaZone — Nordens største utviklerkonferanse. javaBin er en frivillig organisasjon som jobber for å fremme Java og teknologi i Norge.`
			}
		])
		.onConflictDoNothing();

	await db
		.insert(contactCards)
		.values([
			{ title: 'E-post', actionType: 'email', actionValue: 'kids@java.no', sortOrder: 0 },
			{ title: 'javaBin', actionType: 'link', actionValue: 'https://java.no', sortOrder: 1 },
			{ title: 'JavaZone', actionType: 'link', actionValue: 'https://javazone.no', sortOrder: 2 },
			{ title: 'Telefonnummer', actionType: 'phone', actionValue: '41123456', sortOrder: 3 }
		])
		.onConflictDoNothing();

	console.log('Content seeded.');
	process.exit(0);
}

seed();
