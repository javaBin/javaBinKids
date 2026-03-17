import { json, error } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { images } from '$lib/server/db/schema';
import { validateSession } from '$lib/server/auth';

const MAX_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

export async function POST({ request, cookies }) {
	const adminUserId = await validateSession(cookies);
	if (!adminUserId) throw error(401, 'Ikke autorisert');

	const formData = await request.formData();
	const file = formData.get('file') as File;
	if (!file) throw error(400, 'Ingen fil lastet opp');
	if (!ALLOWED_TYPES.includes(file.type)) throw error(400, 'Ugyldig filtype. Bruk JPG, PNG, WebP eller GIF.');
	if (file.size > MAX_SIZE) throw error(400, 'Filen er for stor. Maks 5MB.');

	const buffer = Buffer.from(await file.arrayBuffer());

	const [image] = await db.insert(images).values({
		filename: file.name,
		mimeType: file.type,
		data: buffer
	}).returning({ imageId: images.imageId });

	return json({ imageId: image.imageId, url: `/api/images/${image.imageId}` });
}
