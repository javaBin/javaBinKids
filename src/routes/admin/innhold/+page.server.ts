import { db } from '$lib/server/db';
import { siteContent, contactCards } from '$lib/server/db/schema';
import { asc } from 'drizzle-orm';

export async function load() {
	const rows = await db.select().from(siteContent);
	const contentMap: Record<string, string> = {};
	for (const row of rows) {
		contentMap[row.key] = row.content;
	}

	const cards = await db
		.select()
		.from(contactCards)
		.orderBy(asc(contactCards.sortOrder));

	return {
		heroTitle: contentMap['hero_title'] ?? 'javaBin Kids',
		heroSubtitle: contentMap['hero_subtitle'] ?? 'Kode-arrangementer for barn i regi av javaBin',
		heroText: contentMap['hero_text'] ?? 'Vi arrangerer kvelder med koding, robotprogrammering og andre morsomme aktiviteter for barn i ulike aldersgrupper, i forbindelse med JavaZone-konferansen.',
		omTitle: contentMap['om_title'] ?? '',
		omContent: contentMap['om_content'] ?? '',
		contactCards: cards
	};
}
