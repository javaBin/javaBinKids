import { db } from '$lib/server/db';
import { events } from '$lib/server/db/schema';
import { desc } from 'drizzle-orm';
import { renderMarkdown } from '$lib/server/markdown';

export async function load() {
	const allEvents = await db.select().from(events).orderBy(desc(events.date));

	const withHtml = await Promise.all(
		allEvents.map(async (e) => ({
			...e,
			descriptionHtml: await renderMarkdown(e.description)
		}))
	);

	const now = new Date();
	const upcoming = withHtml.filter((e) => new Date(e.date) >= now && !e.cancelled);
	const past = withHtml.filter((e) => new Date(e.date) < now && !e.cancelled);
	const cancelled = withHtml.filter((e) => e.cancelled);

	return { upcoming, past, cancelled };
}
