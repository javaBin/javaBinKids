import { db } from './db';
import { sessions, adminUsers } from './db/schema';
import { eq, and, gt } from 'drizzle-orm';
import { compare } from 'bcrypt';
import type { Cookies } from '@sveltejs/kit';

const SESSION_COOKIE = 'session';
const SESSION_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours

export async function login(username: string, password: string): Promise<string | null> {
	const [user] = await db
		.select()
		.from(adminUsers)
		.where(eq(adminUsers.username, username));

	if (!user) return null;

	const valid = await compare(password, user.passwordHash);
	if (!valid) return null;

	const [session] = await db
		.insert(sessions)
		.values({
			adminUserId: user.adminUserId,
			expiresAt: new Date(Date.now() + SESSION_DURATION_MS)
		})
		.returning();

	return session.sessionId;
}

export async function validateSession(cookies: Cookies): Promise<string | null> {
	const sessionId = cookies.get(SESSION_COOKIE);
	if (!sessionId) return null;

	const [session] = await db
		.select()
		.from(sessions)
		.where(and(eq(sessions.sessionId, sessionId), gt(sessions.expiresAt, new Date())));

	if (!session) return null;
	return session.adminUserId;
}

export async function logout(cookies: Cookies): Promise<void> {
	const sessionId = cookies.get(SESSION_COOKIE);
	if (sessionId) {
		await db.delete(sessions).where(eq(sessions.sessionId, sessionId));
	}
	cookies.delete(SESSION_COOKIE, { path: '/' });
}

export function setSessionCookie(cookies: Cookies, sessionId: string): void {
	cookies.set(SESSION_COOKIE, sessionId, {
		path: '/',
		httpOnly: true,
		sameSite: 'lax',
		secure: process.env.NODE_ENV === 'production',
		maxAge: SESSION_DURATION_MS / 1000
	});
}
