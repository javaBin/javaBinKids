import { json, error } from '@sveltejs/kit';
import { login, setSessionCookie } from '$lib/server/auth';
import { loginSchema } from '$lib/server/validation';

export async function POST({ request, cookies }) {
	const body = await request.json();
	const parsed = loginSchema.safeParse(body);
	if (!parsed.success) throw error(400, 'Ugyldig innlogging');

	const sessionId = await login(parsed.data.username, parsed.data.password);
	if (!sessionId) throw error(401, 'Feil brukernavn eller passord');

	setSessionCookie(cookies, sessionId);
	return json({ success: true });
}
