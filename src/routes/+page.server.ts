import { db } from '$lib/server/db';
import { events, siteContent } from '$lib/server/db/schema';
import { eq, gt, and } from 'drizzle-orm';

export async function load() {
	const now = new Date();

	const upcomingEvents = await db
		.select()
		.from(events)
		.where(and(gt(events.date, now), eq(events.cancelled, false)))
		.orderBy(events.date)
		.limit(1);

	const nextEvent = upcomingEvents[0] ?? null;

	const rows = await db.select().from(siteContent);
	const content: Record<string, string> = {};
	for (const row of rows) {
		content[row.key] = row.content;
	}

	return {
		nextEvent,
		heroTitle: content['hero_title'] || 'javaBin Kids',
		heroSubtitle: content['hero_subtitle'] || 'Kode-arrangementer for barn i regi av javaBin',
		heroText: content['hero_text'] || 'Vi arrangerer kvelder med koding, robotprogrammering og andre morsomme aktiviteter for barn i ulike aldersgrupper, i forbindelse med JavaZone-konferansen.'
	};
}
