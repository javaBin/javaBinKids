import { json, error } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { courses, registrations, events } from '$lib/server/db/schema';
import { eq, and, count, sql } from 'drizzle-orm';
import { registrationSchema } from '$lib/server/validation';
import { registrationLimiter } from '$lib/server/rateLimit';
import { sendConfirmationEmail, sendWaitlistEmail } from '$lib/server/email';

export async function POST({ request, getClientAddress }) {
	const ip = getClientAddress();
	if (!registrationLimiter.check(ip)) {
		throw error(429, 'For mange forespørsler. Prøv igjen om litt.');
	}

	const body = await request.json();
	const data = body.registration;

	if (!data) throw error(400, 'registration er påkrevd');

	const courseId = data.courseId;
	if (!courseId) throw error(400, 'courseId er påkrevd');

	const parsed = registrationSchema.safeParse(data);
	if (!parsed.success) {
		const errors: Record<string, string> = {};
		for (const issue of parsed.error.issues) {
			errors[issue.path[0] as string] = issue.message;
		}
		return json({ errors }, { status: 400 });
	}

	const { parentName, parentEmail, parentPhone, childName, childAge } = parsed.data;

	// Use transaction with row-level locking
	const result = await db.transaction(async (tx) => {
		// Lock the course row with SELECT ... FOR UPDATE via raw SQL
		const lockedCourses = await tx.execute<typeof courses.$inferSelect>(
			sql`SELECT * FROM courses WHERE "courseId" = ${courseId} FOR UPDATE`
		);
		const course = lockedCourses[0];

		if (!course) throw error(404, 'Kurs ikke funnet');

		// Validate age
		if (childAge < course.ageMin || childAge > course.ageMax) {
			throw error(400, `Alder må være mellom ${course.ageMin} og ${course.ageMax} år`);
		}

		// Check event registration is open
		const [event] = await tx
			.select()
			.from(events)
			.where(eq(events.arrangementId, course.arrangementId));

		const now = new Date();
		if (
			event.cancelled ||
			new Date(event.registrationOpens) > now ||
			new Date(event.registrationCloses) < now
		) {
			throw error(403, 'Påmeldingen er ikke åpen');
		}

		// Check duplicate
		const [existing] = await tx
			.select()
			.from(registrations)
			.where(
				and(
					eq(registrations.courseId, courseId),
					eq(registrations.parentEmail, parentEmail),
					eq(registrations.childName, childName)
				)
			);

		if (existing && existing.status !== 'cancelled') {
			throw error(409, 'Denne påmeldingen finnes allerede');
		}

		// Count confirmed registrations
		const [{ confirmedCount }] = await tx
			.select({ confirmedCount: count() })
			.from(registrations)
			.where(
				and(eq(registrations.courseId, courseId), eq(registrations.status, 'confirmed'))
			);

		const isFull = Number(confirmedCount) >= course.maxParticipants;

		let waitlistPosition: number | null = null;
		if (isFull) {
			const [{ waitlistedCount }] = await tx
				.select({ waitlistedCount: count() })
				.from(registrations)
				.where(
					and(eq(registrations.courseId, courseId), eq(registrations.status, 'waitlisted'))
				);
			waitlistPosition = Number(waitlistedCount) + 1;
		}

		const [registration] = await tx
			.insert(registrations)
			.values({
				courseId,
				parentName,
				parentEmail,
				parentPhone,
				childName,
				childAge,
				status: isFull ? 'waitlisted' : 'confirmed',
				waitlistPosition
			})
			.returning();

		return { registration, event, course };
	});

	// Send email outside transaction
	try {
		const eventDate = new Date(result.event.date).toLocaleDateString('nb-NO', {
			day: 'numeric',
			month: 'long',
			year: 'numeric'
		});

		if (result.registration.status === 'confirmed') {
			await sendConfirmationEmail({
				parentEmail,
				parentName,
				childName,
				courseTitle: result.course.title,
				eventTitle: result.event.title,
				eventDate,
				registrationId: result.registration.registrationId,
				cancellationToken: result.registration.cancellationToken
			});
		} else {
			await sendWaitlistEmail({
				parentEmail,
				parentName,
				childName,
				courseTitle: result.course.title,
				position: result.registration.waitlistPosition!,
				registrationId: result.registration.registrationId,
				cancellationToken: result.registration.cancellationToken
			});
		}
	} catch (e) {
		console.error('Failed to send email:', e);
	}

	return json({
		registration: {
			id: result.registration.registrationId,
			registrationId: result.registration.registrationId,
			status: result.registration.status,
			waitlistPosition: result.registration.waitlistPosition,
			cancellationToken: result.registration.cancellationToken
		}
	});
}
