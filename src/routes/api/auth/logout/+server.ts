import { json } from '@sveltejs/kit';
import { logout } from '$lib/server/auth';

export async function POST({ cookies }) {
	await logout(cookies);
	return json({ success: true });
}
