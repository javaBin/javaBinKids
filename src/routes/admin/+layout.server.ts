import { redirect } from '@sveltejs/kit';
import { validateSession } from '$lib/server/auth';

export async function load({ cookies, url }) {
	if (url.pathname === '/admin/login') return {};

	const adminUserId = await validateSession(cookies);
	if (!adminUserId) throw redirect(303, '/admin/login');

	return { adminUserId };
}
