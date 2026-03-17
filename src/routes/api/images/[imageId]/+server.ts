import { error } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { images } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

export async function GET({ params }) {
	const [image] = await db
		.select()
		.from(images)
		.where(eq(images.imageId, params.imageId));

	if (!image) throw error(404, 'Bilde ikke funnet');

	return new Response(image.data, {
		headers: {
			'Content-Type': image.mimeType,
			'Cache-Control': 'public, max-age=31536000, immutable'
		}
	});
}
