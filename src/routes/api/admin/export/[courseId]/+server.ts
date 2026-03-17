import { error } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { registrations, courses } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { validateSession } from '$lib/server/auth';

export async function GET({ params, cookies }) {
	const adminUserId = await validateSession(cookies);
	if (!adminUserId) throw error(401, 'Ikke autorisert');

	const [course] = await db.select().from(courses).where(eq(courses.courseId, params.courseId));
	if (!course) throw error(404, 'Kurs ikke funnet');

	const regs = await db
		.select()
		.from(registrations)
		.where(eq(registrations.courseId, params.courseId));

	const headers = ['Barnets navn', 'Alder', 'Foresatt', 'E-post', 'Telefon', 'Status', 'Ventelisteposisjon'];
	const rows = regs.map((r) => [
		r.childName,
		r.childAge,
		r.parentName,
		r.parentEmail,
		r.parentPhone,
		r.status,
		r.waitlistPosition ?? ''
	]);

	const csv = [headers.join(','), ...rows.map((r) => r.map((v) => `"${v}"`).join(','))].join('\n');

	return new Response(csv, {
		headers: {
			'Content-Type': 'text/csv; charset=utf-8',
			'Content-Disposition': `attachment; filename="${course.title}-pameldinger.csv"`
		}
	});
}
