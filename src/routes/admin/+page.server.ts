import { db } from '$lib/server/db';
import { events, courses, registrations } from '$lib/server/db/schema';
import { eq, count } from 'drizzle-orm';

export async function load() {
	const now = new Date();

	const allEvents = await db.select().from(events);
	const upcomingEvents = allEvents.filter((e) => new Date(e.date) >= now && !e.cancelled);

	const [{ totalRegistrations }] = await db
		.select({ totalRegistrations: count() })
		.from(registrations)
		.where(eq(registrations.status, 'confirmed'));

	const [{ totalWaitlisted }] = await db
		.select({ totalWaitlisted: count() })
		.from(registrations)
		.where(eq(registrations.status, 'waitlisted'));

	return {
		totalEvents: allEvents.length,
		upcomingCount: upcomingEvents.length,
		totalRegistrations: Number(totalRegistrations),
		totalWaitlisted: Number(totalWaitlisted)
	};
}
