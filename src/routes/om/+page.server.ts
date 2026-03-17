import { db } from '$lib/server/db';
import { siteContent } from '$lib/server/db/schema';
import { marked } from 'marked';

export async function load() {
	const rows = await db.select().from(siteContent);
	const contentMap: Record<string, string> = {};
	for (const row of rows) {
		contentMap[row.key] = row.content;
	}

	const title = contentMap['om_title'] || 'Om javaBin Kids';
	const rawMarkdown = contentMap['om_content'] || '';
	const htmlContent = await marked(rawMarkdown);

	return { title, htmlContent };
}
