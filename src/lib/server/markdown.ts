import { marked } from 'marked';

export async function renderMarkdown(text: string): Promise<string> {
	return await marked(text);
}
