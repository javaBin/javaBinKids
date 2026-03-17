# javaBin Kids Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a SvelteKit website for javaBin Kids that presents coding events for children, handles course registration with waitlists, and provides an admin panel.

**Architecture:** Full-stack SvelteKit 2 with Svelte 5, Drizzle ORM for type-safe PostgreSQL access, Resend for email, Docker Compose for local development. Public pages use server-side load functions; mutations use API routes.

**Tech Stack:** SvelteKit 2, Svelte 5, Drizzle ORM, PostgreSQL, Resend, Zod, bcrypt, Vitest, Docker Compose

**Spec:** `docs/superpowers/specs/2026-03-17-javabin-kids-design.md`

---

## File Map

### Infrastructure
- `docker-compose.yml` — PostgreSQL + pgAdmin services
- `Dockerfile` — Node.js production container
- `.env.example` — Environment variable template
- `drizzle.config.ts` — Drizzle Kit configuration
- `seed.ts` — Admin user + test data seeder
- `package.json` — Dependencies and scripts

### Database Layer
- `src/lib/server/db/index.ts` — Database connection (postgres driver)
- `src/lib/server/db/schema.ts` — Drizzle table definitions (events, courses, registrations, adminUsers, sessions)

### Server Utilities
- `src/lib/server/auth.ts` — Session management (create, validate, destroy)
- `src/lib/server/email.ts` — Resend email functions (confirmation, waitlist, promotion, cancellation)
- `src/lib/server/validation.ts` — Zod schemas for all inputs
- `src/lib/server/rateLimit.ts` — In-memory rate limiter

### Components
- `src/lib/components/Nav.svelte` — Sticky navigation bar
- `src/lib/components/Footer.svelte` — Footer with javaBin links
- `src/lib/components/Bubbles.svelte` — CSS-animated underwater bubbles
- `src/lib/components/EventCard.svelte` — Event summary card
- `src/lib/components/CourseCard.svelte` — Course card with capacity indicator
- `src/lib/components/RegistrationForm.svelte` — Registration form component

### Global Styles
- `src/app.css` — Underwater theme, color palette, global typography
- `src/app.html` — HTML shell

### Public Routes
- `src/routes/+layout.svelte` — Global layout (nav, bubbles, footer)
- `src/routes/+page.svelte` — Landing page
- `src/routes/+page.server.ts` — Load next upcoming event
- `src/routes/+error.svelte` — Error page
- `src/routes/arrangementer/+page.svelte` — Events list
- `src/routes/arrangementer/+page.server.ts` — Load all events
- `src/routes/arrangementer/[arrangementId]/+page.svelte` — Event detail
- `src/routes/arrangementer/[arrangementId]/+page.server.ts` — Load event + courses
- `src/routes/arrangementer/[arrangementId]/pamelding/[courseId]/+page.svelte` — Registration form page
- `src/routes/arrangementer/[arrangementId]/pamelding/[courseId]/+page.server.ts` — Load course + validate registration open
- `src/routes/om/+page.svelte` — About page
- `src/routes/kontakt/+page.svelte` — Contact page

### API Routes
- `src/routes/api/auth/login/+server.ts` — POST admin login
- `src/routes/api/auth/logout/+server.ts` — POST admin logout
- `src/routes/api/registrations/+server.ts` — GET (admin) / POST (public) registrations
- `src/routes/api/registrations/[registrationId]/+server.ts` — PATCH registration (admin)
- `src/routes/api/registrations/[registrationId]/cancel/+server.ts` — POST cancel via token (public)
- `src/routes/api/events/+server.ts` — POST create event (admin)
- `src/routes/api/events/[arrangementId]/+server.ts` — PATCH/DELETE event (admin)
- `src/routes/api/courses/+server.ts` — POST create course (admin)
- `src/routes/api/courses/[courseId]/+server.ts` — PATCH/DELETE course (admin)
- `src/routes/api/admin/export/[courseId]/+server.ts` — GET CSV export (admin)

### Admin Routes
- `src/routes/admin/+layout.server.ts` — Auth guard for all admin pages
- `src/routes/admin/+layout.svelte` — Admin layout with sidebar nav
- `src/routes/admin/+page.svelte` — Dashboard
- `src/routes/admin/+page.server.ts` — Load dashboard stats
- `src/routes/admin/login/+page.svelte` — Login form
- `src/routes/admin/arrangementer/+page.svelte` — Event list (admin)
- `src/routes/admin/arrangementer/+page.server.ts` — Load events for admin
- `src/routes/admin/arrangementer/[arrangementId]/+page.svelte` — Edit event + courses
- `src/routes/admin/arrangementer/[arrangementId]/+page.server.ts` — Load event for editing
- `src/routes/admin/pameldinger/+page.svelte` — Registrations view
- `src/routes/admin/pameldinger/+page.server.ts` — Load registrations with filters

### Tests
- `src/lib/server/__tests__/validation.test.ts` — Zod schema tests
- `src/lib/server/__tests__/auth.test.ts` — Auth function tests
- `src/lib/server/__tests__/registration.test.ts` — Registration logic tests (seat allocation, waitlist)
- `src/lib/server/__tests__/rateLimit.test.ts` — Rate limiter tests

---

## Task 1: Project Scaffolding

**Files:**
- Create: `package.json`, `svelte.config.js`, `vite.config.ts`, `tsconfig.json`, `src/app.html`, `src/app.css`, `.env.example`, `.gitignore`, `docker-compose.yml`, `Dockerfile`, `drizzle.config.ts`

- [ ] **Step 1: Scaffold SvelteKit project**

```bash
cd /Users/joachimhaagenskeie/Projects/javaBin/javaBinKids
npx sv create . --template minimal --types ts --no-add-ons --no-install
```

- [ ] **Step 2: Install dependencies**

```bash
npm install drizzle-orm postgres zod bcrypt resend
npm install -D drizzle-kit @types/bcrypt vitest @sveltejs/adapter-node
```

- [ ] **Step 3: Configure adapter-node in svelte.config.js**

Replace `@sveltejs/adapter-auto` with `@sveltejs/adapter-node`:

```js
import adapter from '@sveltejs/adapter-node';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		adapter: adapter()
	}
};

export default config;
```

- [ ] **Step 4: Create .env.example**

```
DATABASE_URL=postgres://javabin:javabin@localhost:5432/javabinkids
RESEND_API_KEY=re_your_api_key
ADMIN_USERNAME=admin
ADMIN_PASSWORD=changeme
BASE_URL=http://localhost:5173
```

- [ ] **Step 5: Create .gitignore additions**

Append to `.gitignore`:
```
.env
.superpowers/
```

- [ ] **Step 6: Create docker-compose.yml**

```yaml
services:
  db:
    image: postgres:17
    restart: unless-stopped
    environment:
      POSTGRES_USER: javabin
      POSTGRES_PASSWORD: javabin
      POSTGRES_DB: javabinkids
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data

volumes:
  pgdata:
```

- [ ] **Step 7: Create Dockerfile**

```dockerfile
FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:22-alpine
WORKDIR /app
COPY --from=build /app/build ./build
COPY --from=build /app/package*.json ./
COPY --from=build /app/node_modules ./node_modules
EXPOSE 3000
ENV NODE_ENV=production
CMD ["node", "build"]
```

- [ ] **Step 8: Create drizzle.config.ts**

```ts
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
	schema: './src/lib/server/db/schema.ts',
	out: './drizzle/migrations',
	dialect: 'postgresql',
	dbCredentials: {
		url: process.env.DATABASE_URL!
	},
	casing: 'camelCase'
});
```

- [ ] **Step 9: Verify project builds**

```bash
docker compose up -d db
npm run build
```

- [ ] **Step 10: Initialize git and commit**

```bash
git init
git add .
git commit -m "chore: scaffold SvelteKit project with Docker Compose"
```

---

## Task 2: Database Schema and Migrations

**Files:**
- Create: `src/lib/server/db/schema.ts`, `src/lib/server/db/index.ts`

- [ ] **Step 1: Create database connection**

Create `src/lib/server/db/index.ts`:

```ts
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

const connectionString = process.env.DATABASE_URL!;
const client = postgres(connectionString);
export const db = drizzle(client, { schema, casing: 'camelCase' });
```

- [ ] **Step 2: Create schema definitions**

Create `src/lib/server/db/schema.ts`:

```ts
import { pgTable, uuid, text, timestamp, integer, boolean, unique } from 'drizzle-orm/pg-core';

export const events = pgTable('events', {
	arrangementId: uuid().primaryKey().defaultRandom(),
	title: text().notNull(),
	description: text().notNull(),
	date: timestamp().notNull(),
	location: text().notNull(),
	cancelled: boolean().notNull().default(false),
	registrationOpens: timestamp().notNull(),
	registrationCloses: timestamp().notNull(),
	imageUrl: text(),
	createdAt: timestamp().notNull().defaultNow(),
	updatedAt: timestamp().notNull().defaultNow().$onUpdate(() => new Date())
});

export const courses = pgTable('courses', {
	courseId: uuid().primaryKey().defaultRandom(),
	arrangementId: uuid().notNull().references(() => events.arrangementId, { onDelete: 'restrict' }),
	title: text().notNull(),
	description: text().notNull(),
	ageMin: integer().notNull(),
	ageMax: integer().notNull(),
	maxParticipants: integer().notNull(),
	createdAt: timestamp().notNull().defaultNow(),
	updatedAt: timestamp().notNull().defaultNow().$onUpdate(() => new Date())
});

export const registrations = pgTable('registrations', (t) => ({
	registrationId: uuid().primaryKey().defaultRandom(),
	courseId: uuid().notNull().references(() => courses.courseId),
	parentName: text().notNull(),
	parentEmail: text().notNull(),
	parentPhone: text().notNull(),
	childName: text().notNull(),
	childAge: integer().notNull(),
	status: text().notNull().default('confirmed'),
	waitlistPosition: integer(),
	cancellationToken: uuid().notNull().defaultRandom(),
	createdAt: timestamp().notNull().defaultNow(),
	updatedAt: timestamp().notNull().defaultNow().$onUpdate(() => new Date())
}), (table) => [
	unique().on(table.courseId, table.parentEmail, table.childName)
]);

export const adminUsers = pgTable('admin_users', {
	adminUserId: uuid().primaryKey().defaultRandom(),
	username: text().notNull().unique(),
	passwordHash: text().notNull(),
	createdAt: timestamp().notNull().defaultNow()
});

export const sessions = pgTable('sessions', {
	sessionId: uuid().primaryKey().defaultRandom(),
	adminUserId: uuid().notNull().references(() => adminUsers.adminUserId),
	expiresAt: timestamp().notNull(),
	createdAt: timestamp().notNull().defaultNow()
});
```

- [ ] **Step 3: Generate and run migration**

```bash
cp .env.example .env
npx drizzle-kit generate
npx drizzle-kit migrate
```

- [ ] **Step 4: Create seed script**

Create `seed.ts`:

```ts
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import { hash } from 'bcrypt';
import * as schema from './src/lib/server/db/schema';

const client = postgres(process.env.DATABASE_URL!);
const db = drizzle(client, { schema, casing: 'camelCase' });

async function seed() {
	const username = process.env.ADMIN_USERNAME || 'admin';
	const password = process.env.ADMIN_PASSWORD || 'changeme';
	const passwordHash = await hash(password, 10);

	await db.insert(schema.adminUsers).values({
		username,
		passwordHash
	}).onConflictDoNothing();

	// Sample event
	const [event] = await db.insert(schema.events).values({
		title: 'javaBin Kids Høst 2026',
		description: 'En kveld med koding og robotprogrammering for barn! Vi har aktiviteter tilpasset ulike aldersgrupper.',
		date: new Date('2026-09-04T17:00:00'),
		location: 'NOVA Spektrum, Lillestrøm',
		registrationOpens: new Date('2026-06-01T00:00:00'),
		registrationCloses: new Date('2026-09-03T23:59:59')
	}).returning();

	await db.insert(schema.courses).values([
		{
			arrangementId: event.arrangementId,
			title: 'Scratch for nybegynnere',
			description: 'Lær å programmere med Scratch! Lag ditt eget spill med blokk-programmering.',
			ageMin: 6,
			ageMax: 9,
			maxParticipants: 20
		},
		{
			arrangementId: event.arrangementId,
			title: 'Robotprogrammering med micro:bit',
			description: 'Programmer micro:bit til å styre roboter! Lær om sensorer og motorer.',
			ageMin: 8,
			ageMax: 12,
			maxParticipants: 15
		},
		{
			arrangementId: event.arrangementId,
			title: 'Webutvikling med HTML og CSS',
			description: 'Lag din egen nettside fra bunnen av. Lær grunnleggende HTML og CSS.',
			ageMin: 10,
			ageMax: 14,
			maxParticipants: 20
		}
	]);

	console.log('Seed completed successfully');
	await client.end();
}

seed().catch(console.error);
```

- [ ] **Step 5: Add seed script to package.json**

Add to `scripts` in `package.json`:
```json
"db:seed": "npx tsx seed.ts",
"db:generate": "drizzle-kit generate",
"db:migrate": "drizzle-kit migrate"
```

- [ ] **Step 6: Run seed**

```bash
npm run db:seed
```

- [ ] **Step 7: Commit**

```bash
git add .
git commit -m "feat: add database schema, migrations, and seed script"
```

---

## Task 3: Validation and Server Utilities

**Files:**
- Create: `src/lib/server/validation.ts`, `src/lib/server/auth.ts`, `src/lib/server/email.ts`, `src/lib/server/rateLimit.ts`
- Test: `src/lib/server/__tests__/validation.test.ts`, `src/lib/server/__tests__/auth.test.ts`, `src/lib/server/__tests__/rateLimit.test.ts`

- [ ] **Step 1: Write validation schema tests**

Create `src/lib/server/__tests__/validation.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { registrationSchema, eventSchema, courseSchema, loginSchema } from '../validation';

describe('registrationSchema', () => {
	it('accepts valid registration', () => {
		const result = registrationSchema.safeParse({
			parentName: 'Ola Nordmann',
			parentEmail: 'ola@example.com',
			parentPhone: '99887766',
			childName: 'Lille Ola',
			childAge: 8
		});
		expect(result.success).toBe(true);
	});

	it('rejects invalid email', () => {
		const result = registrationSchema.safeParse({
			parentName: 'Ola',
			parentEmail: 'not-an-email',
			parentPhone: '99887766',
			childName: 'Lille Ola',
			childAge: 8
		});
		expect(result.success).toBe(false);
	});

	it('rejects missing child name', () => {
		const result = registrationSchema.safeParse({
			parentName: 'Ola',
			parentEmail: 'ola@example.com',
			parentPhone: '99887766',
			childName: '',
			childAge: 8
		});
		expect(result.success).toBe(false);
	});

	it('rejects age below 3', () => {
		const result = registrationSchema.safeParse({
			parentName: 'Ola',
			parentEmail: 'ola@example.com',
			parentPhone: '99887766',
			childName: 'Baby',
			childAge: 2
		});
		expect(result.success).toBe(false);
	});
});

describe('loginSchema', () => {
	it('accepts valid login', () => {
		const result = loginSchema.safeParse({ username: 'admin', password: 'secret' });
		expect(result.success).toBe(true);
	});

	it('rejects empty password', () => {
		const result = loginSchema.safeParse({ username: 'admin', password: '' });
		expect(result.success).toBe(false);
	});
});
```

- [ ] **Step 2: Run tests — expect failure**

```bash
npx vitest run src/lib/server/__tests__/validation.test.ts
```

- [ ] **Step 3: Implement validation schemas**

Create `src/lib/server/validation.ts`:

```ts
import { z } from 'zod';

export const registrationSchema = z.object({
	parentName: z.string().min(1, 'Navn er påkrevd'),
	parentEmail: z.string().email('Ugyldig e-postadresse'),
	parentPhone: z.string().min(8, 'Ugyldig telefonnummer'),
	childName: z.string().min(1, 'Barnets navn er påkrevd'),
	childAge: z.number().int().min(3, 'Minimum alder er 3').max(18, 'Maksimum alder er 18')
});

export const eventSchema = z.object({
	title: z.string().min(1, 'Tittel er påkrevd'),
	description: z.string().min(1, 'Beskrivelse er påkrevd'),
	date: z.string().datetime(),
	location: z.string().min(1, 'Sted er påkrevd'),
	registrationOpens: z.string().datetime(),
	registrationCloses: z.string().datetime(),
	imageUrl: z.string().url().optional()
});

export const courseSchema = z.object({
	arrangementId: z.string().uuid(),
	title: z.string().min(1, 'Tittel er påkrevd'),
	description: z.string().min(1, 'Beskrivelse er påkrevd'),
	ageMin: z.number().int().min(3),
	ageMax: z.number().int().max(18),
	maxParticipants: z.number().int().min(1)
});

export const loginSchema = z.object({
	username: z.string().min(1, 'Brukernavn er påkrevd'),
	password: z.string().min(1, 'Passord er påkrevd')
});

export type RegistrationInput = z.infer<typeof registrationSchema>;
export type EventInput = z.infer<typeof eventSchema>;
export type CourseInput = z.infer<typeof courseSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
```

- [ ] **Step 4: Run validation tests — expect pass**

```bash
npx vitest run src/lib/server/__tests__/validation.test.ts
```

- [ ] **Step 5: Write rate limiter tests**

Create `src/lib/server/__tests__/rateLimit.test.ts`:

```ts
import { describe, it, expect, beforeEach } from 'vitest';
import { createRateLimiter } from '../rateLimit';

describe('createRateLimiter', () => {
	let limiter: ReturnType<typeof createRateLimiter>;

	beforeEach(() => {
		limiter = createRateLimiter({ windowMs: 1000, maxRequests: 3 });
	});

	it('allows requests within limit', () => {
		expect(limiter.check('127.0.0.1')).toBe(true);
		expect(limiter.check('127.0.0.1')).toBe(true);
		expect(limiter.check('127.0.0.1')).toBe(true);
	});

	it('blocks requests over limit', () => {
		limiter.check('127.0.0.1');
		limiter.check('127.0.0.1');
		limiter.check('127.0.0.1');
		expect(limiter.check('127.0.0.1')).toBe(false);
	});

	it('tracks IPs independently', () => {
		limiter.check('127.0.0.1');
		limiter.check('127.0.0.1');
		limiter.check('127.0.0.1');
		expect(limiter.check('127.0.0.2')).toBe(true);
	});
});
```

- [ ] **Step 6: Implement rate limiter**

Create `src/lib/server/rateLimit.ts`:

```ts
interface RateLimitConfig {
	windowMs: number;
	maxRequests: number;
}

interface RateLimitEntry {
	count: number;
	resetTime: number;
}

export function createRateLimiter(config: RateLimitConfig) {
	const store = new Map<string, RateLimitEntry>();

	return {
		check(ip: string): boolean {
			const now = Date.now();
			const entry = store.get(ip);

			if (!entry || now > entry.resetTime) {
				store.set(ip, { count: 1, resetTime: now + config.windowMs });
				return true;
			}

			entry.count++;
			return entry.count <= config.maxRequests;
		}
	};
}

export const registrationLimiter = createRateLimiter({
	windowMs: 60 * 1000,
	maxRequests: 5
});
```

- [ ] **Step 7: Run rate limiter tests — expect pass**

```bash
npx vitest run src/lib/server/__tests__/rateLimit.test.ts
```

- [ ] **Step 8: Implement auth helpers**

Create `src/lib/server/auth.ts`:

```ts
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
```

- [ ] **Step 9: Implement email helper**

Create `src/lib/server/email.ts`:

```ts
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM_EMAIL = 'javaBin Kids <kids@javabin.no>';
const BASE_URL = process.env.BASE_URL || 'http://localhost:5173';

export async function sendConfirmationEmail(params: {
	parentEmail: string;
	parentName: string;
	childName: string;
	courseTitle: string;
	eventTitle: string;
	eventDate: string;
	registrationId: string;
	cancellationToken: string;
}) {
	const cancelUrl = `${BASE_URL}/api/registrations/${params.registrationId}/cancel?token=${params.cancellationToken}`;

	await resend.emails.send({
		from: FROM_EMAIL,
		to: params.parentEmail,
		subject: `Påmelding bekreftet: ${params.courseTitle}`,
		html: `
			<h1>Hei ${params.parentName}!</h1>
			<p>${params.childName} er nå påmeldt <strong>${params.courseTitle}</strong> under ${params.eventTitle}.</p>
			<p><strong>Dato:</strong> ${params.eventDate}</p>
			<p>Dersom du ønsker å avbestille, <a href="${cancelUrl}">klikk her</a>.</p>
			<p>Vi gleder oss!</p>
			<p>Hilsen javaBin Kids</p>
		`
	});
}

export async function sendWaitlistEmail(params: {
	parentEmail: string;
	parentName: string;
	childName: string;
	courseTitle: string;
	position: number;
	registrationId: string;
	cancellationToken: string;
}) {
	const cancelUrl = `${BASE_URL}/api/registrations/${params.registrationId}/cancel?token=${params.cancellationToken}`;

	await resend.emails.send({
		from: FROM_EMAIL,
		to: params.parentEmail,
		subject: `Venteliste: ${params.courseTitle}`,
		html: `
			<h1>Hei ${params.parentName}!</h1>
			<p>${params.childName} er satt på venteliste for <strong>${params.courseTitle}</strong>.</p>
			<p>Posisjon på venteliste: <strong>${params.position}</strong></p>
			<p>Du vil motta e-post dersom en plass blir ledig.</p>
			<p>Dersom du ønsker å avbestille, <a href="${cancelUrl}">klikk her</a>.</p>
			<p>Hilsen javaBin Kids</p>
		`
	});
}

export async function sendPromotionEmail(params: {
	parentEmail: string;
	parentName: string;
	childName: string;
	courseTitle: string;
	eventTitle: string;
	eventDate: string;
}) {
	await resend.emails.send({
		from: FROM_EMAIL,
		to: params.parentEmail,
		subject: `Plass ledig: ${params.courseTitle}`,
		html: `
			<h1>Gode nyheter, ${params.parentName}!</h1>
			<p>En plass har blitt ledig, og ${params.childName} er nå bekreftet påmeldt <strong>${params.courseTitle}</strong> under ${params.eventTitle}.</p>
			<p><strong>Dato:</strong> ${params.eventDate}</p>
			<p>Vi gleder oss!</p>
			<p>Hilsen javaBin Kids</p>
		`
	});
}

export async function sendCancellationEmail(params: {
	parentEmail: string;
	parentName: string;
	childName: string;
	courseTitle: string;
}) {
	await resend.emails.send({
		from: FROM_EMAIL,
		to: params.parentEmail,
		subject: `Avmelding bekreftet: ${params.courseTitle}`,
		html: `
			<h1>Hei ${params.parentName}!</h1>
			<p>Påmeldingen for ${params.childName} til <strong>${params.courseTitle}</strong> er nå avbestilt.</p>
			<p>Hilsen javaBin Kids</p>
		`
	});
}
```

- [ ] **Step 10: Run all tests**

```bash
npx vitest run
```

- [ ] **Step 11: Commit**

```bash
git add .
git commit -m "feat: add validation, auth, email, and rate limiting utilities"
```

---

## Task 4: Global Styles and Layout

**Files:**
- Create: `src/app.css`, `src/app.html`, `src/routes/+layout.svelte`, `src/routes/+error.svelte`, `src/lib/components/Nav.svelte`, `src/lib/components/Footer.svelte`, `src/lib/components/Bubbles.svelte`

- [ ] **Step 1: Create app.html shell**

Replace `src/app.html`:

```html
<!doctype html>
<html lang="no">
	<head>
		<meta charset="utf-8" />
		<link rel="icon" href="%sveltekit.assets%/favicon.png" />
		<meta name="viewport" content="width=device-width, initial-scale=1" />
		<title>javaBin Kids</title>
		%sveltekit.head%
	</head>
	<body data-sveltekit-preload-data="hover">
		<div style="display: contents">%sveltekit.body%</div>
	</body>
</html>
```

- [ ] **Step 2: Create global CSS with underwater theme**

Replace `src/app.css`:

```css
@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800&family=Inter:wght@400;500;600&display=swap');

:root {
	--color-bg-deep: #0d1b2a;
	--color-bg-mid: #1a2f3a;
	--color-bg-light: #243b4a;
	--color-heading: #7ec8c8;
	--color-accent: #d4a843;
	--color-accent-hover: #e0b84e;
	--color-text: #e8e8e8;
	--color-text-muted: #a0b4c0;
	--color-success: #4caf50;
	--color-warning: #f0a830;
	--color-error: #e74c3c;
	--color-card: rgba(255, 255, 255, 0.05);
	--color-card-hover: rgba(255, 255, 255, 0.08);
	--color-border: rgba(255, 255, 255, 0.1);
	--font-display: 'Nunito', sans-serif;
	--font-body: 'Inter', sans-serif;
	--radius: 12px;
	--radius-lg: 20px;
	--max-width: 1100px;
}

*, *::before, *::after {
	box-sizing: border-box;
	margin: 0;
	padding: 0;
}

html {
	scroll-behavior: smooth;
}

body {
	font-family: var(--font-body);
	background: linear-gradient(180deg, var(--color-bg-mid) 0%, var(--color-bg-deep) 100%);
	color: var(--color-text);
	min-height: 100vh;
	line-height: 1.6;
	font-size: 18px;
}

h1, h2, h3, h4 {
	font-family: var(--font-display);
	color: var(--color-heading);
	font-weight: 700;
	line-height: 1.2;
}

h1 { font-size: 2.5rem; }
h2 { font-size: 2rem; }
h3 { font-size: 1.4rem; }

a {
	color: var(--color-accent);
	text-decoration: none;
	transition: color 0.2s;
}

a:hover {
	color: var(--color-accent-hover);
}

.container {
	max-width: var(--max-width);
	margin: 0 auto;
	padding: 0 1.5rem;
}

.btn {
	display: inline-block;
	padding: 0.8rem 2rem;
	border-radius: var(--radius);
	font-family: var(--font-display);
	font-weight: 700;
	font-size: 1.1rem;
	border: 2px solid transparent;
	cursor: pointer;
	transition: all 0.2s;
	text-align: center;
}

.btn-primary {
	background: var(--color-accent);
	color: var(--color-bg-deep);
	border-color: var(--color-accent);
}

.btn-primary:hover {
	background: var(--color-accent-hover);
	border-color: var(--color-accent-hover);
}

.btn-outline {
	background: transparent;
	color: var(--color-accent);
	border-color: var(--color-accent);
}

.btn-outline:hover {
	background: var(--color-accent);
	color: var(--color-bg-deep);
}

.card {
	background: var(--color-card);
	border: 1px solid var(--color-border);
	border-radius: var(--radius-lg);
	padding: 1.5rem;
	transition: background 0.2s;
}

.card:hover {
	background: var(--color-card-hover);
}

.badge {
	display: inline-block;
	padding: 0.25rem 0.75rem;
	border-radius: 999px;
	font-size: 0.85rem;
	font-weight: 600;
}

.badge-success {
	background: rgba(76, 175, 80, 0.2);
	color: var(--color-success);
}

.badge-warning {
	background: rgba(240, 168, 48, 0.2);
	color: var(--color-warning);
}

.badge-error {
	background: rgba(231, 76, 60, 0.2);
	color: var(--color-error);
}

input, select, textarea {
	width: 100%;
	padding: 0.8rem 1rem;
	border-radius: var(--radius);
	border: 2px solid var(--color-border);
	background: rgba(255, 255, 255, 0.05);
	color: var(--color-text);
	font-family: var(--font-body);
	font-size: 1rem;
	transition: border-color 0.2s;
}

input:focus, select:focus, textarea:focus {
	outline: none;
	border-color: var(--color-heading);
}

label {
	display: block;
	margin-bottom: 0.4rem;
	font-weight: 600;
	color: var(--color-text-muted);
}

.form-group {
	margin-bottom: 1.2rem;
}

.error-text {
	color: var(--color-error);
	font-size: 0.85rem;
	margin-top: 0.3rem;
}

@media (max-width: 768px) {
	body { font-size: 16px; }
	h1 { font-size: 1.8rem; }
	h2 { font-size: 1.5rem; }
	h3 { font-size: 1.2rem; }
}
```

- [ ] **Step 3: Create Bubbles component**

Create `src/lib/components/Bubbles.svelte`:

```svelte
<div class="bubbles" aria-hidden="true">
	{#each Array(15) as _, i}
		<div
			class="bubble"
			style="
				--size: {8 + Math.random() * 40}px;
				--left: {Math.random() * 100}%;
				--delay: {Math.random() * 15}s;
				--duration: {10 + Math.random() * 20}s;
				--opacity: {0.03 + Math.random() * 0.08};
			"
		></div>
	{/each}
</div>

<style>
	.bubbles {
		position: fixed;
		inset: 0;
		overflow: hidden;
		pointer-events: none;
		z-index: 0;
	}

	.bubble {
		position: absolute;
		bottom: -100px;
		left: var(--left);
		width: var(--size);
		height: var(--size);
		border-radius: 50%;
		background: rgba(126, 200, 200, var(--opacity));
		border: 1px solid rgba(126, 200, 200, calc(var(--opacity) * 0.5));
		animation: rise var(--duration) ease-in var(--delay) infinite;
	}

	@keyframes rise {
		0% {
			transform: translateY(0) scale(1);
			opacity: 1;
		}
		100% {
			transform: translateY(-110vh) scale(0.5);
			opacity: 0;
		}
	}
</style>
```

- [ ] **Step 4: Create Nav component**

Create `src/lib/components/Nav.svelte`:

```svelte
<script lang="ts">
	import { page } from '$app/state';

	const links = [
		{ href: '/arrangementer', label: 'Arrangementer' },
		{ href: '/om', label: 'Om' },
		{ href: '/kontakt', label: 'Kontakt' }
	];

	let menuOpen = $state(false);
</script>

<nav class="nav">
	<div class="nav-inner container">
		<a href="/" class="logo">javaBin Kids</a>

		<button class="menu-toggle" onclick={() => menuOpen = !menuOpen} aria-label="Meny">
			<span class="hamburger" class:open={menuOpen}></span>
		</button>

		<ul class="nav-links" class:open={menuOpen}>
			{#each links as link}
				<li>
					<a
						href={link.href}
						class:active={page.url.pathname.startsWith(link.href)}
						onclick={() => menuOpen = false}
					>
						{link.label}
					</a>
				</li>
			{/each}
		</ul>
	</div>
</nav>

<style>
	.nav {
		position: sticky;
		top: 0;
		z-index: 100;
		background: rgba(13, 27, 42, 0.9);
		backdrop-filter: blur(10px);
		border-bottom: 1px solid var(--color-border);
	}

	.nav-inner {
		display: flex;
		align-items: center;
		justify-content: space-between;
		height: 64px;
	}

	.logo {
		font-family: var(--font-display);
		font-size: 1.4rem;
		font-weight: 800;
		color: var(--color-heading);
	}

	.logo:hover {
		color: var(--color-accent);
	}

	.nav-links {
		display: flex;
		list-style: none;
		gap: 2rem;
	}

	.nav-links a {
		color: var(--color-text-muted);
		font-weight: 500;
		transition: color 0.2s;
	}

	.nav-links a:hover,
	.nav-links a.active {
		color: var(--color-text);
	}

	.menu-toggle {
		display: none;
		background: none;
		border: none;
		cursor: pointer;
		padding: 0.5rem;
	}

	.hamburger {
		display: block;
		width: 24px;
		height: 2px;
		background: var(--color-text);
		position: relative;
		transition: background 0.2s;
	}

	.hamburger::before,
	.hamburger::after {
		content: '';
		position: absolute;
		width: 24px;
		height: 2px;
		background: var(--color-text);
		transition: transform 0.2s;
	}

	.hamburger::before { top: -7px; }
	.hamburger::after { top: 7px; }

	.hamburger.open {
		background: transparent;
	}

	.hamburger.open::before {
		transform: rotate(45deg);
		top: 0;
	}

	.hamburger.open::after {
		transform: rotate(-45deg);
		top: 0;
	}

	@media (max-width: 768px) {
		.menu-toggle { display: block; }

		.nav-links {
			display: none;
			position: absolute;
			top: 64px;
			left: 0;
			right: 0;
			background: rgba(13, 27, 42, 0.95);
			flex-direction: column;
			padding: 1rem 1.5rem;
			gap: 0;
			border-bottom: 1px solid var(--color-border);
		}

		.nav-links.open { display: flex; }

		.nav-links li a {
			display: block;
			padding: 0.75rem 0;
		}
	}
</style>
```

- [ ] **Step 5: Create Footer component**

Create `src/lib/components/Footer.svelte`:

```svelte
<footer class="footer">
	<div class="container footer-inner">
		<span>Made by <a href="https://java.no" target="_blank" rel="noopener">javaBin</a></span>
		<span><a href="https://java.no/principles" target="_blank" rel="noopener">Code of conduct</a></span>
	</div>
</footer>

<style>
	.footer {
		border-top: 1px solid var(--color-border);
		padding: 1.5rem 0;
		margin-top: 4rem;
		text-align: center;
	}

	.footer-inner {
		display: flex;
		justify-content: center;
		gap: 2rem;
		font-size: 0.9rem;
		color: var(--color-text-muted);
	}
</style>
```

- [ ] **Step 6: Create root layout**

Replace `src/routes/+layout.svelte`:

```svelte
<script lang="ts">
	import '../app.css';
	import Nav from '$lib/components/Nav.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import Bubbles from '$lib/components/Bubbles.svelte';

	let { children } = $props();
</script>

<Bubbles />
<Nav />
<main>
	{@render children()}
</main>
<Footer />

<style>
	main {
		position: relative;
		z-index: 1;
		min-height: calc(100vh - 64px - 100px);
	}
</style>
```

- [ ] **Step 7: Create error page**

Create `src/routes/+error.svelte`:

```svelte
<script lang="ts">
	import { page } from '$app/state';
</script>

<div class="container error-page">
	<h1>{page.status}</h1>
	<p>{page.error?.message || 'Noe gikk galt'}</p>
	<a href="/" class="btn btn-outline">Tilbake til forsiden</a>
</div>

<style>
	.error-page {
		text-align: center;
		padding: 6rem 1.5rem;
	}

	h1 {
		font-size: 5rem;
		margin-bottom: 0.5rem;
	}

	p {
		font-size: 1.3rem;
		color: var(--color-text-muted);
		margin-bottom: 2rem;
	}
</style>
```

- [ ] **Step 8: Verify dev server starts**

```bash
npm run dev
```

Visit `http://localhost:5173` — should see blank page with nav, bubbles, and footer.

- [ ] **Step 9: Commit**

```bash
git add .
git commit -m "feat: add underwater theme, nav, footer, and bubbles components"
```

---

## Task 5: Public Pages — Landing, About, Contact

**Files:**
- Create: `src/routes/+page.svelte`, `src/routes/+page.server.ts`, `src/routes/om/+page.svelte`, `src/routes/kontakt/+page.svelte`

- [ ] **Step 1: Create landing page server load**

Create `src/routes/+page.server.ts`:

```ts
import { db } from '$lib/server/db';
import { events, courses, registrations } from '$lib/server/db/schema';
import { eq, gt, and, count } from 'drizzle-orm';

export async function load() {
	const now = new Date();

	const upcomingEvents = await db
		.select()
		.from(events)
		.where(and(gt(events.date, now), eq(events.cancelled, false)))
		.orderBy(events.date)
		.limit(1);

	const nextEvent = upcomingEvents[0] ?? null;

	let eventCourses: Array<typeof courses.$inferSelect & { confirmedCount: number }> = [];

	if (nextEvent) {
		const coursesWithCounts = await db
			.select({
				course: courses,
				confirmedCount: count(registrations.registrationId)
			})
			.from(courses)
			.leftJoin(
				registrations,
				and(
					eq(registrations.courseId, courses.courseId),
					eq(registrations.status, 'confirmed')
				)
			)
			.where(eq(courses.arrangementId, nextEvent.arrangementId))
			.groupBy(courses.courseId);

		eventCourses = coursesWithCounts.map((row) => ({
			...row.course,
			confirmedCount: Number(row.confirmedCount)
		}));
	}

	return { nextEvent, courses: eventCourses };
}
```

- [ ] **Step 2: Create landing page**

Replace `src/routes/+page.svelte`:

```svelte
<script lang="ts">
	import EventCard from '$lib/components/EventCard.svelte';
	import CourseCard from '$lib/components/CourseCard.svelte';

	let { data } = $props();
</script>

<svelte:head>
	<title>javaBin Kids — Koding for barn</title>
</svelte:head>

<section class="hero">
	<div class="container hero-content">
		<h1>javaBin Kids</h1>
		<p class="hero-subtitle">Kode-arrangementer for barn i regi av javaBin</p>
		<p class="hero-text">
			Vi arrangerer kvelder med koding, robotprogrammering og andre morsomme
			aktiviteter for barn i ulike aldersgrupper, i forbindelse med JavaZone-konferansen.
		</p>
		{#if data.nextEvent}
			<a href="/arrangementer/{data.nextEvent.arrangementId}" class="btn btn-primary">
				Se neste arrangement
			</a>
		{:else}
			<p class="hero-muted">Ingen kommende arrangementer ennå — følg med!</p>
		{/if}
	</div>
</section>

{#if data.nextEvent}
	<section class="next-event container">
		<h2>Neste arrangement</h2>
		<EventCard event={data.nextEvent} />

		{#if data.courses.length > 0}
			<h3>Kurs og aktiviteter</h3>
			<div class="courses-grid">
				{#each data.courses as course}
					<CourseCard {course} arrangementId={data.nextEvent.arrangementId} />
				{/each}
			</div>
		{/if}
	</section>
{/if}

<style>
	.hero {
		text-align: center;
		padding: 6rem 1.5rem 4rem;
	}

	.hero-content {
		max-width: 700px;
	}

	.hero-subtitle {
		font-family: var(--font-display);
		font-size: 1.3rem;
		color: var(--color-accent);
		margin: 0.5rem 0 1rem;
	}

	.hero-text {
		color: var(--color-text-muted);
		margin-bottom: 2rem;
		font-size: 1.1rem;
	}

	.hero-muted {
		color: var(--color-text-muted);
		font-style: italic;
	}

	.next-event {
		padding: 2rem 1.5rem 4rem;
	}

	.next-event h2 {
		margin-bottom: 1.5rem;
	}

	.next-event h3 {
		margin: 2rem 0 1rem;
	}

	.courses-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
		gap: 1.5rem;
	}
</style>
```

- [ ] **Step 3: Create EventCard component**

Create `src/lib/components/EventCard.svelte`:

```svelte
<script lang="ts">
	interface Props {
		event: {
			arrangementId: string;
			title: string;
			description: string;
			date: Date;
			location: string;
			cancelled: boolean;
		};
	}

	let { event }: Props = $props();

	const dateStr = new Date(event.date).toLocaleDateString('nb-NO', {
		weekday: 'long',
		day: 'numeric',
		month: 'long',
		year: 'numeric'
	});

	const isPast = new Date(event.date) < new Date();
</script>

<a href="/arrangementer/{event.arrangementId}" class="card event-card">
	{#if event.cancelled}
		<span class="badge badge-error">Avlyst</span>
	{:else if isPast}
		<span class="badge badge-warning">Gjennomført</span>
	{:else}
		<span class="badge badge-success">Kommende</span>
	{/if}
	<h3>{event.title}</h3>
	<p class="event-meta">{dateStr} — {event.location}</p>
	<p class="event-desc">{event.description}</p>
</a>

<style>
	.event-card {
		display: block;
		text-decoration: none;
		color: inherit;
	}

	.event-card h3 {
		margin: 0.75rem 0 0.25rem;
	}

	.event-meta {
		color: var(--color-accent);
		font-size: 0.95rem;
		margin-bottom: 0.5rem;
	}

	.event-desc {
		color: var(--color-text-muted);
		font-size: 0.95rem;
	}
</style>
```

- [ ] **Step 4: Create CourseCard component**

Create `src/lib/components/CourseCard.svelte`:

```svelte
<script lang="ts">
	interface Props {
		course: {
			courseId: string;
			title: string;
			description: string;
			ageMin: number;
			ageMax: number;
			maxParticipants: number;
			confirmedCount: number;
		};
		arrangementId: string;
	}

	let { course, arrangementId }: Props = $props();

	const spotsLeft = course.maxParticipants - course.confirmedCount;
	const isFull = spotsLeft <= 0;
</script>

<div class="card course-card">
	<div class="course-header">
		<h3>{course.title}</h3>
		<span class="age-badge">{course.ageMin}–{course.ageMax} år</span>
	</div>
	<p class="course-desc">{course.description}</p>
	<div class="course-footer">
		<span class="spots" class:full={isFull}>
			{#if isFull}
				Fullt (venteliste)
			{:else}
				{spotsLeft} av {course.maxParticipants} plasser ledig
			{/if}
		</span>
		<a
			href="/arrangementer/{arrangementId}/pamelding/{course.courseId}"
			class="btn btn-primary btn-sm"
		>
			{isFull ? 'Sett på venteliste' : 'Meld på'}
		</a>
	</div>
</div>

<style>
	.course-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		margin-bottom: 0.5rem;
	}

	.age-badge {
		white-space: nowrap;
		padding: 0.2rem 0.6rem;
		border-radius: 999px;
		background: rgba(126, 200, 200, 0.15);
		color: var(--color-heading);
		font-size: 0.85rem;
		font-weight: 600;
	}

	.course-desc {
		color: var(--color-text-muted);
		font-size: 0.95rem;
		margin-bottom: 1rem;
	}

	.course-footer {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
	}

	.spots {
		font-size: 0.9rem;
		color: var(--color-success);
	}

	.spots.full {
		color: var(--color-warning);
	}

	:global(.btn-sm) {
		padding: 0.5rem 1.2rem;
		font-size: 0.95rem;
	}
</style>
```

- [ ] **Step 5: Create About page**

Create `src/routes/om/+page.svelte`:

```svelte
<svelte:head>
	<title>Om — javaBin Kids</title>
</svelte:head>

<div class="container page">
	<h1>Om javaBin Kids</h1>

	<section>
		<h2>Hva er javaBin Kids?</h2>
		<p>
			javaBin Kids er kode-arrangementer for barn, organisert av javaBin — Norges
			største Java-brukergruppe. Vi arrangerer kvelder med koding, robotprogrammering
			og andre morsomme aktiviteter i forbindelse med JavaZone-konferansen.
		</p>
	</section>

	<section>
		<h2>Hvem er det for?</h2>
		<p>
			Arrangementene er rettet mot barn i alderen 6–14 år. Hvert kurs har sin egen
			aldersgruppe, slik at innholdet er tilpasset deltakernes nivå. Ingen forkunnskaper
			er nødvendig!
		</p>
	</section>

	<section>
		<h2>Hva skjer på en kveld?</h2>
		<p>
			En typisk kveld har flere parallelle kurs og aktiviteter. Barna kan velge mellom
			blant annet Scratch-programmering, roboter med micro:bit, webutvikling med HTML
			og CSS, og mer. Erfarne frivillige veileder barna gjennom kveldens aktiviteter.
		</p>
	</section>

	<section>
		<h2>Om javaBin</h2>
		<p>
			javaBin er Norges Java User Group (JUG) og arrangerer JavaZone — Nordens
			største utviklerkonferanse. javaBin er en frivillig organisasjon som jobber
			for å fremme Java og teknologi i Norge.
		</p>
	</section>
</div>

<style>
	.page {
		padding: 4rem 1.5rem;
	}

	h1 {
		margin-bottom: 2rem;
	}

	section {
		margin-bottom: 2rem;
	}

	section h2 {
		margin-bottom: 0.5rem;
		font-size: 1.3rem;
	}

	section p {
		color: var(--color-text-muted);
		max-width: 700px;
	}
</style>
```

- [ ] **Step 6: Create Contact page**

Create `src/routes/kontakt/+page.svelte`:

```svelte
<svelte:head>
	<title>Kontakt — javaBin Kids</title>
</svelte:head>

<div class="container page">
	<h1>Kontakt oss</h1>

	<div class="contact-info">
		<div class="card contact-card">
			<h3>E-post</h3>
			<p><a href="mailto:kids@javabin.no">kids@javabin.no</a></p>
		</div>

		<div class="card contact-card">
			<h3>javaBin</h3>
			<p><a href="https://java.no" target="_blank" rel="noopener">java.no</a></p>
		</div>

		<div class="card contact-card">
			<h3>JavaZone</h3>
			<p><a href="https://javazone.no" target="_blank" rel="noopener">javazone.no</a></p>
		</div>
	</div>
</div>

<style>
	.page {
		padding: 4rem 1.5rem;
	}

	h1 {
		margin-bottom: 2rem;
	}

	.contact-info {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
		gap: 1.5rem;
		max-width: 800px;
	}

	.contact-card h3 {
		margin-bottom: 0.5rem;
	}
</style>
```

- [ ] **Step 7: Verify all pages render**

```bash
npm run dev
```

Visit `/`, `/om`, `/kontakt`.

- [ ] **Step 8: Commit**

```bash
git add .
git commit -m "feat: add landing page, about, and contact pages"
```

---

## Task 6: Events List and Detail Pages

**Files:**
- Create: `src/routes/arrangementer/+page.server.ts`, `src/routes/arrangementer/+page.svelte`, `src/routes/arrangementer/[arrangementId]/+page.server.ts`, `src/routes/arrangementer/[arrangementId]/+page.svelte`

- [ ] **Step 1: Create events list server load**

Create `src/routes/arrangementer/+page.server.ts`:

```ts
import { db } from '$lib/server/db';
import { events } from '$lib/server/db/schema';
import { desc } from 'drizzle-orm';

export async function load() {
	const allEvents = await db.select().from(events).orderBy(desc(events.date));

	const now = new Date();
	const upcoming = allEvents.filter((e) => new Date(e.date) >= now && !e.cancelled);
	const past = allEvents.filter((e) => new Date(e.date) < now && !e.cancelled);
	const cancelled = allEvents.filter((e) => e.cancelled);

	return { upcoming, past, cancelled };
}
```

- [ ] **Step 2: Create events list page**

Create `src/routes/arrangementer/+page.svelte`:

```svelte
<script lang="ts">
	import EventCard from '$lib/components/EventCard.svelte';

	let { data } = $props();
</script>

<svelte:head>
	<title>Arrangementer — javaBin Kids</title>
</svelte:head>

<div class="container page">
	<h1>Arrangementer</h1>

	{#if data.upcoming.length > 0}
		<section>
			<h2>Kommende</h2>
			<div class="events-grid">
				{#each data.upcoming as event}
					<EventCard {event} />
				{/each}
			</div>
		</section>
	{/if}

	{#if data.past.length > 0}
		<section>
			<h2>Tidligere</h2>
			<div class="events-grid">
				{#each data.past as event}
					<EventCard {event} />
				{/each}
			</div>
		</section>
	{/if}

	{#if data.upcoming.length === 0 && data.past.length === 0}
		<p class="empty">Ingen arrangementer ennå.</p>
	{/if}
</div>

<style>
	.page {
		padding: 4rem 1.5rem;
	}

	h1 { margin-bottom: 2rem; }

	section {
		margin-bottom: 3rem;
	}

	section h2 {
		margin-bottom: 1rem;
	}

	.events-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
		gap: 1.5rem;
	}

	.empty {
		color: var(--color-text-muted);
		font-style: italic;
	}
</style>
```

- [ ] **Step 3: Create event detail server load**

Create `src/routes/arrangementer/[arrangementId]/+page.server.ts`:

```ts
import { db } from '$lib/server/db';
import { events, courses, registrations } from '$lib/server/db/schema';
import { eq, and, count } from 'drizzle-orm';
import { error } from '@sveltejs/kit';

export async function load({ params }) {
	const [event] = await db
		.select()
		.from(events)
		.where(eq(events.arrangementId, params.arrangementId));

	if (!event) throw error(404, 'Arrangement ikke funnet');

	const coursesWithCounts = await db
		.select({
			course: courses,
			confirmedCount: count(registrations.registrationId)
		})
		.from(courses)
		.leftJoin(
			registrations,
			and(
				eq(registrations.courseId, courses.courseId),
				eq(registrations.status, 'confirmed')
			)
		)
		.where(eq(courses.arrangementId, params.arrangementId))
		.groupBy(courses.courseId);

	const eventCourses = coursesWithCounts.map((row) => ({
		...row.course,
		confirmedCount: Number(row.confirmedCount)
	}));

	const now = new Date();
	const registrationOpen =
		!event.cancelled &&
		new Date(event.registrationOpens) <= now &&
		new Date(event.registrationCloses) >= now;

	return { event, courses: eventCourses, registrationOpen };
}
```

- [ ] **Step 4: Create event detail page**

Create `src/routes/arrangementer/[arrangementId]/+page.svelte`:

```svelte
<script lang="ts">
	import CourseCard from '$lib/components/CourseCard.svelte';

	let { data } = $props();

	const dateStr = new Date(data.event.date).toLocaleDateString('nb-NO', {
		weekday: 'long',
		day: 'numeric',
		month: 'long',
		year: 'numeric',
		hour: '2-digit',
		minute: '2-digit'
	});
</script>

<svelte:head>
	<title>{data.event.title} — javaBin Kids</title>
</svelte:head>

<div class="container page">
	{#if data.event.cancelled}
		<div class="badge badge-error">Avlyst</div>
	{/if}

	<h1>{data.event.title}</h1>
	<p class="meta">{dateStr} — {data.event.location}</p>
	<p class="description">{data.event.description}</p>

	{#if !data.registrationOpen && !data.event.cancelled}
		<div class="card notice">
			<p>Påmeldingen er ikke åpen for øyeblikket.</p>
			<p class="muted">
				Åpner: {new Date(data.event.registrationOpens).toLocaleDateString('nb-NO', { day: 'numeric', month: 'long', year: 'numeric' })}
			</p>
		</div>
	{/if}

	{#if data.courses.length > 0}
		<h2>Kurs og aktiviteter</h2>
		<div class="courses-grid">
			{#each data.courses as course}
				<CourseCard {course} arrangementId={data.event.arrangementId} />
			{/each}
		</div>
	{/if}
</div>

<style>
	.page { padding: 4rem 1.5rem; }
	h1 { margin-bottom: 0.5rem; }
	h2 { margin: 2rem 0 1rem; }

	.meta {
		color: var(--color-accent);
		font-size: 1.1rem;
		margin-bottom: 1rem;
	}

	.description {
		color: var(--color-text-muted);
		max-width: 700px;
		margin-bottom: 2rem;
	}

	.notice {
		margin-bottom: 2rem;
	}

	.muted {
		color: var(--color-text-muted);
		font-size: 0.9rem;
	}

	.courses-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
		gap: 1.5rem;
	}
</style>
```

- [ ] **Step 5: Verify with seeded data**

```bash
npm run dev
```

Visit `/arrangementer` and click into the seeded event.

- [ ] **Step 6: Commit**

```bash
git add .
git commit -m "feat: add events list and event detail pages"
```

---

## Task 7: Registration System

**Files:**
- Create: `src/routes/arrangementer/[arrangementId]/pamelding/[courseId]/+page.server.ts`, `src/routes/arrangementer/[arrangementId]/pamelding/[courseId]/+page.svelte`, `src/lib/components/RegistrationForm.svelte`, `src/routes/api/registrations/+server.ts`, `src/routes/api/registrations/[registrationId]/cancel/+server.ts`
- Test: `src/lib/server/__tests__/registration.test.ts`

- [ ] **Step 1: Write registration logic tests**

Create `src/lib/server/__tests__/registration.test.ts`:

```ts
import { describe, it, expect } from 'vitest';

describe('registration logic', () => {
	it('determines confirmed status when seats available', () => {
		const confirmedCount = 5;
		const maxParticipants = 10;
		const status = confirmedCount < maxParticipants ? 'confirmed' : 'waitlisted';
		expect(status).toBe('confirmed');
	});

	it('determines waitlisted status when full', () => {
		const confirmedCount = 10;
		const maxParticipants = 10;
		const status = confirmedCount < maxParticipants ? 'confirmed' : 'waitlisted';
		expect(status).toBe('waitlisted');
	});

	it('calculates waitlist position', () => {
		const currentWaitlisted = 3;
		const newPosition = currentWaitlisted + 1;
		expect(newPosition).toBe(4);
	});
});
```

- [ ] **Step 2: Run tests — expect pass** (pure logic, no deps)

```bash
npx vitest run src/lib/server/__tests__/registration.test.ts
```

- [ ] **Step 3: Create registration page server load**

Create `src/routes/arrangementer/[arrangementId]/pamelding/[courseId]/+page.server.ts`:

```ts
import { db } from '$lib/server/db';
import { events, courses, registrations } from '$lib/server/db/schema';
import { eq, and, count } from 'drizzle-orm';
import { error } from '@sveltejs/kit';

export async function load({ params }) {
	const [event] = await db
		.select()
		.from(events)
		.where(eq(events.arrangementId, params.arrangementId));

	if (!event) throw error(404, 'Arrangement ikke funnet');

	const [course] = await db
		.select()
		.from(courses)
		.where(
			and(
				eq(courses.courseId, params.courseId),
				eq(courses.arrangementId, params.arrangementId)
			)
		);

	if (!course) throw error(404, 'Kurs ikke funnet');

	const now = new Date();
	const registrationOpen =
		!event.cancelled &&
		new Date(event.registrationOpens) <= now &&
		new Date(event.registrationCloses) >= now;

	if (!registrationOpen) {
		throw error(403, 'Påmeldingen er ikke åpen');
	}

	const [{ confirmedCount }] = await db
		.select({ confirmedCount: count() })
		.from(registrations)
		.where(
			and(
				eq(registrations.courseId, course.courseId),
				eq(registrations.status, 'confirmed')
			)
		);

	const spotsLeft = course.maxParticipants - Number(confirmedCount);

	return { event, course, spotsLeft };
}
```

- [ ] **Step 4: Create RegistrationForm component**

Create `src/lib/components/RegistrationForm.svelte`:

```svelte
<script lang="ts">
	interface Props {
		courseId: string;
		ageMin: number;
		ageMax: number;
	}

	let { courseId, ageMin, ageMax }: Props = $props();

	let parentName = $state('');
	let parentEmail = $state('');
	let parentPhone = $state('');
	let childName = $state('');
	let childAge = $state<number | undefined>(undefined);
	let submitting = $state(false);
	let result = $state<{ success: boolean; message: string } | null>(null);
	let errors = $state<Record<string, string>>({});

	async function handleSubmit(e: SubmitEvent) {
		e.preventDefault();
		errors = {};
		submitting = true;
		result = null;

		try {
			const res = await fetch('/api/registrations', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					courseId,
					parentName,
					parentEmail,
					parentPhone,
					childName,
					childAge
				})
			});

			const data = await res.json();

			if (!res.ok) {
				if (data.errors) {
					errors = data.errors;
				} else {
					result = { success: false, message: data.message || 'Noe gikk galt' };
				}
			} else {
				result = {
					success: true,
					message: data.status === 'waitlisted'
						? `${childName} er satt på venteliste (posisjon ${data.waitlistPosition}). Bekreftelse sendt til ${parentEmail}.`
						: `${childName} er påmeldt! Bekreftelse sendt til ${parentEmail}.`
				};
			}
		} catch {
			result = { success: false, message: 'Kunne ikke sende påmelding. Prøv igjen.' };
		} finally {
			submitting = false;
		}
	}
</script>

{#if result?.success}
	<div class="card success-card">
		<h3>{result.message.includes('venteliste') ? 'Venteliste' : 'Påmeldt!'}</h3>
		<p>{result.message}</p>
		<a href="/arrangementer" class="btn btn-outline">Tilbake til arrangementer</a>
	</div>
{:else}
	<form onsubmit={handleSubmit} class="registration-form">
		{#if result && !result.success}
			<div class="error-banner">{result.message}</div>
		{/if}

		<div class="form-group">
			<label for="childName">Barnets navn</label>
			<input id="childName" bind:value={childName} required />
			{#if errors.childName}<span class="error-text">{errors.childName}</span>{/if}
		</div>

		<div class="form-group">
			<label for="childAge">Barnets alder ({ageMin}–{ageMax} år)</label>
			<input id="childAge" type="number" min={ageMin} max={ageMax} bind:value={childAge} required />
			{#if errors.childAge}<span class="error-text">{errors.childAge}</span>{/if}
		</div>

		<div class="form-group">
			<label for="parentName">Foresattes navn</label>
			<input id="parentName" bind:value={parentName} required />
			{#if errors.parentName}<span class="error-text">{errors.parentName}</span>{/if}
		</div>

		<div class="form-group">
			<label for="parentEmail">E-post</label>
			<input id="parentEmail" type="email" bind:value={parentEmail} required />
			{#if errors.parentEmail}<span class="error-text">{errors.parentEmail}</span>{/if}
		</div>

		<div class="form-group">
			<label for="parentPhone">Telefon</label>
			<input id="parentPhone" type="tel" bind:value={parentPhone} required />
			{#if errors.parentPhone}<span class="error-text">{errors.parentPhone}</span>{/if}
		</div>

		<button type="submit" class="btn btn-primary" disabled={submitting}>
			{submitting ? 'Sender...' : 'Meld på'}
		</button>
	</form>
{/if}

<style>
	.registration-form {
		max-width: 500px;
	}

	.success-card {
		max-width: 500px;
		text-align: center;
	}

	.success-card h3 {
		margin-bottom: 0.5rem;
	}

	.success-card p {
		color: var(--color-text-muted);
		margin-bottom: 1.5rem;
	}

	.error-banner {
		background: rgba(231, 76, 60, 0.15);
		border: 1px solid var(--color-error);
		border-radius: var(--radius);
		padding: 0.8rem 1rem;
		color: var(--color-error);
		margin-bottom: 1rem;
	}

	button:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}
</style>
```

- [ ] **Step 5: Create registration page**

Create `src/routes/arrangementer/[arrangementId]/pamelding/[courseId]/+page.svelte`:

```svelte
<script lang="ts">
	import RegistrationForm from '$lib/components/RegistrationForm.svelte';

	let { data } = $props();
</script>

<svelte:head>
	<title>Påmelding: {data.course.title} — javaBin Kids</title>
</svelte:head>

<div class="container page">
	<a href="/arrangementer/{data.event.arrangementId}" class="back-link">
		&larr; Tilbake til {data.event.title}
	</a>

	<h1>Påmelding: {data.course.title}</h1>
	<p class="meta">{data.event.title} — {data.course.ageMin}–{data.course.ageMax} år</p>

	{#if data.spotsLeft > 0}
		<p class="spots">{data.spotsLeft} plasser ledig</p>
	{:else}
		<p class="spots full">Fullt — du kan melde deg på ventelisten</p>
	{/if}

	<RegistrationForm
		courseId={data.course.courseId}
		ageMin={data.course.ageMin}
		ageMax={data.course.ageMax}
	/>
</div>

<style>
	.page { padding: 4rem 1.5rem; }

	.back-link {
		display: inline-block;
		margin-bottom: 1.5rem;
		color: var(--color-text-muted);
		font-size: 0.95rem;
	}

	h1 { margin-bottom: 0.25rem; }

	.meta {
		color: var(--color-accent);
		margin-bottom: 0.5rem;
	}

	.spots {
		color: var(--color-success);
		margin-bottom: 2rem;
		font-weight: 600;
	}

	.spots.full {
		color: var(--color-warning);
	}
</style>
```

- [ ] **Step 6: Create registration API route**

Create `src/routes/api/registrations/+server.ts`:

```ts
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
	const courseId = body.courseId;

	if (!courseId) throw error(400, 'courseId er påkrevd');

	const parsed = registrationSchema.safeParse(body);
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
		const lockedCourses = await tx.execute(
			sql`SELECT * FROM courses WHERE "courseId" = ${courseId} FOR UPDATE`
		);
		const course = lockedCourses.rows[0] as typeof courses.$inferSelect | undefined;

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
		registrationId: result.registration.registrationId,
		status: result.registration.status,
		waitlistPosition: result.registration.waitlistPosition
	});
}
```

- [ ] **Step 7: Create cancellation API route**

Create `src/routes/api/registrations/[registrationId]/cancel/+server.ts`:

```ts
import { json, error } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { registrations, courses, events } from '$lib/server/db/schema';
import { eq, and, asc, sql } from 'drizzle-orm';
import { sendCancellationEmail, sendPromotionEmail } from '$lib/server/email';

export async function POST({ params, url }) {
	const token = url.searchParams.get('token');
	if (!token) throw error(400, 'Token mangler');

	const [registration] = await db
		.select()
		.from(registrations)
		.where(
			and(
				eq(registrations.registrationId, params.registrationId),
				eq(registrations.cancellationToken, token)
			)
		);

	if (!registration) throw error(404, 'Påmelding ikke funnet');
	if (registration.status === 'cancelled') throw error(400, 'Allerede avmeldt');

	const wasConfirmed = registration.status === 'confirmed';

	// Cancel the registration
	await db
		.update(registrations)
		.set({ status: 'cancelled', waitlistPosition: null })
		.where(eq(registrations.registrationId, params.registrationId));

	// Get course and event info for emails
	const [course] = await db.select().from(courses).where(eq(courses.courseId, registration.courseId));
	const [event] = await db.select().from(events).where(eq(events.arrangementId, course.arrangementId));

	// Send cancellation email
	try {
		await sendCancellationEmail({
			parentEmail: registration.parentEmail,
			parentName: registration.parentName,
			childName: registration.childName,
			courseTitle: course.title
		});
	} catch (e) {
		console.error('Failed to send cancellation email:', e);
	}

	// If was confirmed, promote next from waitlist
	if (wasConfirmed) {
		const [nextWaitlisted] = await db
			.select()
			.from(registrations)
			.where(
				and(
					eq(registrations.courseId, registration.courseId),
					eq(registrations.status, 'waitlisted')
				)
			)
			.orderBy(asc(registrations.waitlistPosition))
			.limit(1);

		if (nextWaitlisted) {
			await db
				.update(registrations)
				.set({ status: 'confirmed', waitlistPosition: null })
				.where(eq(registrations.registrationId, nextWaitlisted.registrationId));

			// Decrement remaining waitlist positions
			await db.execute(
				sql`UPDATE registrations SET "waitlistPosition" = "waitlistPosition" - 1 WHERE "courseId" = ${registration.courseId} AND status = 'waitlisted' AND "waitlistPosition" IS NOT NULL`
			);

			try {
				const eventDate = new Date(event.date).toLocaleDateString('nb-NO', {
					day: 'numeric',
					month: 'long',
					year: 'numeric'
				});

				await sendPromotionEmail({
					parentEmail: nextWaitlisted.parentEmail,
					parentName: nextWaitlisted.parentName,
					childName: nextWaitlisted.childName,
					courseTitle: course.title,
					eventTitle: event.title,
					eventDate
				});
			} catch (e) {
				console.error('Failed to send promotion email:', e);
			}
		}
	}

	return json({ message: 'Påmelding avbestilt' });
}
```

- [ ] **Step 8: Run all tests**

```bash
npx vitest run
```

- [ ] **Step 9: Commit**

```bash
git add .
git commit -m "feat: add registration system with waitlist and cancellation"
```

---

## Task 8: Admin Authentication

**Files:**
- Create: `src/routes/admin/login/+page.svelte`, `src/routes/api/auth/login/+server.ts`, `src/routes/api/auth/logout/+server.ts`, `src/routes/admin/+layout.server.ts`

- [ ] **Step 1: Create login API route**

Create `src/routes/api/auth/login/+server.ts`:

```ts
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
```

- [ ] **Step 2: Create logout API route**

Create `src/routes/api/auth/logout/+server.ts`:

```ts
import { json } from '@sveltejs/kit';
import { logout } from '$lib/server/auth';

export async function POST({ cookies }) {
	await logout(cookies);
	return json({ success: true });
}
```

- [ ] **Step 3: Create admin auth guard**

Create `src/routes/admin/+layout.server.ts`:

```ts
import { redirect } from '@sveltejs/kit';
import { validateSession } from '$lib/server/auth';

export async function load({ cookies, url }) {
	if (url.pathname === '/admin/login') return {};

	const adminUserId = await validateSession(cookies);
	if (!adminUserId) throw redirect(303, '/admin/login');

	return { adminUserId };
}
```

- [ ] **Step 4: Create login page**

Create `src/routes/admin/login/+page.svelte`:

```svelte
<script lang="ts">
	import { goto } from '$app/navigation';

	let username = $state('');
	let password = $state('');
	let errorMsg = $state('');
	let submitting = $state(false);

	async function handleLogin(e: SubmitEvent) {
		e.preventDefault();
		submitting = true;
		errorMsg = '';

		try {
			const res = await fetch('/api/auth/login', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ username, password })
			});

			if (!res.ok) {
				errorMsg = 'Feil brukernavn eller passord';
			} else {
				goto('/admin');
			}
		} catch {
			errorMsg = 'Noe gikk galt. Prøv igjen.';
		} finally {
			submitting = false;
		}
	}
</script>

<svelte:head>
	<title>Admin — javaBin Kids</title>
</svelte:head>

<div class="container login-page">
	<div class="login-card card">
		<h1>Admin</h1>

		{#if errorMsg}
			<div class="error-banner">{errorMsg}</div>
		{/if}

		<form onsubmit={handleLogin}>
			<div class="form-group">
				<label for="username">Brukernavn</label>
				<input id="username" bind:value={username} required autocomplete="username" />
			</div>

			<div class="form-group">
				<label for="password">Passord</label>
				<input id="password" type="password" bind:value={password} required autocomplete="current-password" />
			</div>

			<button type="submit" class="btn btn-primary" disabled={submitting}>
				{submitting ? 'Logger inn...' : 'Logg inn'}
			</button>
		</form>
	</div>
</div>

<style>
	.login-page {
		display: flex;
		justify-content: center;
		align-items: center;
		min-height: calc(100vh - 200px);
		padding: 2rem 1.5rem;
	}

	.login-card {
		width: 100%;
		max-width: 400px;
		padding: 2rem;
	}

	.login-card h1 {
		text-align: center;
		margin-bottom: 1.5rem;
	}

	.error-banner {
		background: rgba(231, 76, 60, 0.15);
		border: 1px solid var(--color-error);
		border-radius: var(--radius);
		padding: 0.8rem;
		color: var(--color-error);
		margin-bottom: 1rem;
		text-align: center;
	}

	button {
		width: 100%;
	}
</style>
```

- [ ] **Step 5: Commit**

```bash
git add .
git commit -m "feat: add admin authentication with login and session management"
```

---

## Task 9: Admin Panel — Dashboard and Event Management

**Files:**
- Create: `src/routes/admin/+layout.svelte`, `src/routes/admin/+page.svelte`, `src/routes/admin/+page.server.ts`, `src/routes/admin/arrangementer/+page.svelte`, `src/routes/admin/arrangementer/+page.server.ts`, `src/routes/admin/arrangementer/[arrangementId]/+page.svelte`, `src/routes/admin/arrangementer/[arrangementId]/+page.server.ts`, `src/routes/api/events/+server.ts`, `src/routes/api/events/[arrangementId]/+server.ts`, `src/routes/api/courses/+server.ts`, `src/routes/api/courses/[courseId]/+server.ts`

- [ ] **Step 1: Create admin layout**

Create `src/routes/admin/+layout.svelte`:

```svelte
<script lang="ts">
	import { page } from '$app/state';
	import { goto } from '$app/navigation';

	let { children } = $props();

	const adminLinks = [
		{ href: '/admin', label: 'Dashboard' },
		{ href: '/admin/arrangementer', label: 'Arrangementer' },
		{ href: '/admin/pameldinger', label: 'Påmeldinger' }
	];

	async function handleLogout() {
		await fetch('/api/auth/logout', { method: 'POST' });
		goto('/admin/login');
	}
</script>

{#if page.url.pathname === '/admin/login'}
	{@render children()}
{:else}
	<div class="admin-layout">
		<aside class="admin-sidebar">
			<h3>Admin</h3>
			<nav>
				{#each adminLinks as link}
					<a href={link.href} class:active={page.url.pathname === link.href}>
						{link.label}
					</a>
				{/each}
			</nav>
			<button class="btn btn-outline btn-sm logout-btn" onclick={handleLogout}>Logg ut</button>
		</aside>
		<div class="admin-content">
			{@render children()}
		</div>
	</div>
{/if}

<style>
	.admin-layout {
		display: flex;
		min-height: calc(100vh - 64px);
	}

	.admin-sidebar {
		width: 220px;
		padding: 1.5rem;
		background: rgba(0, 0, 0, 0.2);
		border-right: 1px solid var(--color-border);
		display: flex;
		flex-direction: column;
	}

	.admin-sidebar h3 {
		margin-bottom: 1.5rem;
	}

	.admin-sidebar nav {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
		flex: 1;
	}

	.admin-sidebar nav a {
		padding: 0.5rem 0.75rem;
		border-radius: var(--radius);
		color: var(--color-text-muted);
		font-weight: 500;
	}

	.admin-sidebar nav a:hover,
	.admin-sidebar nav a.active {
		background: rgba(255, 255, 255, 0.05);
		color: var(--color-text);
	}

	.logout-btn {
		margin-top: auto;
		font-size: 0.85rem;
	}

	.admin-content {
		flex: 1;
		padding: 2rem;
		overflow-y: auto;
	}

	@media (max-width: 768px) {
		.admin-layout { flex-direction: column; }
		.admin-sidebar {
			width: 100%;
			flex-direction: row;
			align-items: center;
			gap: 1rem;
			padding: 0.75rem 1rem;
		}
		.admin-sidebar h3 { margin-bottom: 0; }
		.admin-sidebar nav { flex-direction: row; }
		.logout-btn { margin-top: 0; }
	}
</style>
```

- [ ] **Step 2: Create admin dashboard server load**

Create `src/routes/admin/+page.server.ts`:

```ts
import { db } from '$lib/server/db';
import { events, courses, registrations } from '$lib/server/db/schema';
import { eq, and, gt, count } from 'drizzle-orm';

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
```

- [ ] **Step 3: Create admin dashboard page**

Create `src/routes/admin/+page.svelte`:

```svelte
<script lang="ts">
	let { data } = $props();
</script>

<h1>Dashboard</h1>

<div class="stats-grid">
	<div class="card stat-card">
		<span class="stat-value">{data.totalEvents}</span>
		<span class="stat-label">Arrangementer totalt</span>
	</div>
	<div class="card stat-card">
		<span class="stat-value">{data.upcomingCount}</span>
		<span class="stat-label">Kommende</span>
	</div>
	<div class="card stat-card">
		<span class="stat-value">{data.totalRegistrations}</span>
		<span class="stat-label">Bekreftede påmeldinger</span>
	</div>
	<div class="card stat-card">
		<span class="stat-value">{data.totalWaitlisted}</span>
		<span class="stat-label">På venteliste</span>
	</div>
</div>

<style>
	h1 { margin-bottom: 2rem; }

	.stats-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
		gap: 1rem;
	}

	.stat-card {
		text-align: center;
		padding: 1.5rem;
	}

	.stat-value {
		display: block;
		font-size: 2.5rem;
		font-weight: 800;
		font-family: var(--font-display);
		color: var(--color-heading);
	}

	.stat-label {
		color: var(--color-text-muted);
		font-size: 0.9rem;
	}
</style>
```

- [ ] **Step 4: Create event management API routes**

Create `src/routes/api/events/+server.ts`:

```ts
import { json, error } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { events } from '$lib/server/db/schema';
import { validateSession } from '$lib/server/auth';
import { eventSchema } from '$lib/server/validation';

export async function POST({ request, cookies }) {
	const adminUserId = await validateSession(cookies);
	if (!adminUserId) throw error(401, 'Ikke autorisert');

	const body = await request.json();
	const parsed = eventSchema.safeParse(body);
	if (!parsed.success) return json({ errors: parsed.error.flatten().fieldErrors }, { status: 400 });

	const [event] = await db
		.insert(events)
		.values({
			title: parsed.data.title,
			description: parsed.data.description,
			date: new Date(parsed.data.date),
			location: parsed.data.location,
			registrationOpens: new Date(parsed.data.registrationOpens),
			registrationCloses: new Date(parsed.data.registrationCloses),
			imageUrl: parsed.data.imageUrl
		})
		.returning();

	return json(event, { status: 201 });
}
```

Create `src/routes/api/events/[arrangementId]/+server.ts`:

```ts
import { json, error } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { events, courses, registrations } from '$lib/server/db/schema';
import { eq, and, ne, count } from 'drizzle-orm';
import { validateSession } from '$lib/server/auth';

export async function PATCH({ params, request, cookies }) {
	const adminUserId = await validateSession(cookies);
	if (!adminUserId) throw error(401, 'Ikke autorisert');

	const body = await request.json();
	const [updated] = await db
		.update(events)
		.set(body)
		.where(eq(events.arrangementId, params.arrangementId))
		.returning();

	if (!updated) throw error(404, 'Arrangement ikke funnet');
	return json(updated);
}

export async function DELETE({ params, cookies }) {
	const adminUserId = await validateSession(cookies);
	if (!adminUserId) throw error(401, 'Ikke autorisert');

	// Check for courses with active registrations
	const eventCourses = await db.select().from(courses).where(eq(courses.arrangementId, params.arrangementId));
	for (const course of eventCourses) {
		const [{ activeCount }] = await db
			.select({ activeCount: count() })
			.from(registrations)
			.where(and(eq(registrations.courseId, course.courseId), ne(registrations.status, 'cancelled')));
		if (Number(activeCount) > 0) {
			throw error(400, 'Kan ikke slette arrangement med aktive påmeldinger');
		}
	}

	// Delete courses first (FK restrict), then event
	for (const course of eventCourses) {
		await db.delete(courses).where(eq(courses.courseId, course.courseId));
	}
	await db.delete(events).where(eq(events.arrangementId, params.arrangementId));
	return json({ success: true });
}
```

- [ ] **Step 5: Create course management API routes**

Create `src/routes/api/courses/+server.ts`:

```ts
import { json, error } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { courses } from '$lib/server/db/schema';
import { validateSession } from '$lib/server/auth';
import { courseSchema } from '$lib/server/validation';

export async function POST({ request, cookies }) {
	const adminUserId = await validateSession(cookies);
	if (!adminUserId) throw error(401, 'Ikke autorisert');

	const body = await request.json();
	const parsed = courseSchema.safeParse(body);
	if (!parsed.success) return json({ errors: parsed.error.flatten().fieldErrors }, { status: 400 });

	const [course] = await db
		.insert(courses)
		.values({
			arrangementId: parsed.data.arrangementId,
			title: parsed.data.title,
			description: parsed.data.description,
			ageMin: parsed.data.ageMin,
			ageMax: parsed.data.ageMax,
			maxParticipants: parsed.data.maxParticipants
		})
		.returning();

	return json(course, { status: 201 });
}
```

Create `src/routes/api/courses/[courseId]/+server.ts`:

```ts
import { json, error } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { courses, registrations } from '$lib/server/db/schema';
import { eq, and, ne, count } from 'drizzle-orm';
import { validateSession } from '$lib/server/auth';

export async function PATCH({ params, request, cookies }) {
	const adminUserId = await validateSession(cookies);
	if (!adminUserId) throw error(401, 'Ikke autorisert');

	const body = await request.json();
	const [updated] = await db
		.update(courses)
		.set(body)
		.where(eq(courses.courseId, params.courseId))
		.returning();

	if (!updated) throw error(404, 'Kurs ikke funnet');
	return json(updated);
}

export async function DELETE({ params, cookies }) {
	const adminUserId = await validateSession(cookies);
	if (!adminUserId) throw error(401, 'Ikke autorisert');

	// Check for active registrations
	const [{ activeCount }] = await db
		.select({ activeCount: count() })
		.from(registrations)
		.where(
			and(
				eq(registrations.courseId, params.courseId),
				ne(registrations.status, 'cancelled')
			)
		);

	if (Number(activeCount) > 0) {
		throw error(400, 'Kan ikke slette kurs med aktive påmeldinger');
	}

	await db.delete(courses).where(eq(courses.courseId, params.courseId));
	return json({ success: true });
}
```

- [ ] **Step 6: Create admin events list page**

Create `src/routes/admin/arrangementer/+page.server.ts`:

```ts
import { db } from '$lib/server/db';
import { events } from '$lib/server/db/schema';
import { desc } from 'drizzle-orm';

export async function load() {
	const allEvents = await db.select().from(events).orderBy(desc(events.date));
	return { events: allEvents };
}
```

Create `src/routes/admin/arrangementer/+page.svelte`:

```svelte
<script lang="ts">
	import { invalidateAll } from '$app/navigation';

	let { data } = $props();
	let showForm = $state(false);
	let title = $state('');
	let description = $state('');
	let date = $state('');
	let location = $state('');
	let registrationOpens = $state('');
	let registrationCloses = $state('');
	let submitting = $state(false);

	async function createEvent(e: SubmitEvent) {
		e.preventDefault();
		submitting = true;

		const res = await fetch('/api/events', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				title,
				description,
				date: new Date(date).toISOString(),
				location,
				registrationOpens: new Date(registrationOpens).toISOString(),
				registrationCloses: new Date(registrationCloses).toISOString()
			})
		});

		if (res.ok) {
			showForm = false;
			title = description = date = location = registrationOpens = registrationCloses = '';
			invalidateAll();
		}

		submitting = false;
	}
</script>

<div class="header-row">
	<h1>Arrangementer</h1>
	<button class="btn btn-primary" onclick={() => showForm = !showForm}>
		{showForm ? 'Avbryt' : 'Nytt arrangement'}
	</button>
</div>

{#if showForm}
	<form class="card form-card" onsubmit={createEvent}>
		<div class="form-group">
			<label for="title">Tittel</label>
			<input id="title" bind:value={title} required />
		</div>
		<div class="form-group">
			<label for="description">Beskrivelse</label>
			<textarea id="description" bind:value={description} rows="3" required></textarea>
		</div>
		<div class="form-row">
			<div class="form-group">
				<label for="date">Dato</label>
				<input id="date" type="datetime-local" bind:value={date} required />
			</div>
			<div class="form-group">
				<label for="location">Sted</label>
				<input id="location" bind:value={location} required />
			</div>
		</div>
		<div class="form-row">
			<div class="form-group">
				<label for="regOpens">Påmelding åpner</label>
				<input id="regOpens" type="datetime-local" bind:value={registrationOpens} required />
			</div>
			<div class="form-group">
				<label for="regCloses">Påmelding stenger</label>
				<input id="regCloses" type="datetime-local" bind:value={registrationCloses} required />
			</div>
		</div>
		<button type="submit" class="btn btn-primary" disabled={submitting}>Opprett</button>
	</form>
{/if}

<div class="events-list">
	{#each data.events as event}
		<a href="/admin/arrangementer/{event.arrangementId}" class="card event-row">
			<div>
				<strong>{event.title}</strong>
				<span class="date">{new Date(event.date).toLocaleDateString('nb-NO')}</span>
			</div>
			{#if event.cancelled}
				<span class="badge badge-error">Avlyst</span>
			{:else if new Date(event.date) >= new Date()}
				<span class="badge badge-success">Kommende</span>
			{:else}
				<span class="badge badge-warning">Gjennomført</span>
			{/if}
		</a>
	{/each}
</div>

<style>
	.header-row {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 1.5rem;
	}

	.form-card {
		margin-bottom: 2rem;
		padding: 1.5rem;
	}

	.form-row {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 1rem;
	}

	.events-list {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.event-row {
		display: flex;
		justify-content: space-between;
		align-items: center;
		text-decoration: none;
		color: inherit;
	}

	.date {
		color: var(--color-text-muted);
		margin-left: 1rem;
		font-size: 0.9rem;
	}
</style>
```

- [ ] **Step 7: Create admin event edit page**

Create `src/routes/admin/arrangementer/[arrangementId]/+page.server.ts`:

```ts
import { db } from '$lib/server/db';
import { events, courses, registrations } from '$lib/server/db/schema';
import { eq, and, count } from 'drizzle-orm';
import { error } from '@sveltejs/kit';

export async function load({ params }) {
	const [event] = await db
		.select()
		.from(events)
		.where(eq(events.arrangementId, params.arrangementId));

	if (!event) throw error(404, 'Arrangement ikke funnet');

	const eventCourses = await db
		.select({
			course: courses,
			confirmedCount: count(registrations.registrationId)
		})
		.from(courses)
		.leftJoin(
			registrations,
			and(
				eq(registrations.courseId, courses.courseId),
				eq(registrations.status, 'confirmed')
			)
		)
		.where(eq(courses.arrangementId, params.arrangementId))
		.groupBy(courses.courseId);

	return {
		event,
		courses: eventCourses.map((r) => ({
			...r.course,
			confirmedCount: Number(r.confirmedCount)
		}))
	};
}
```

Create `src/routes/admin/arrangementer/[arrangementId]/+page.svelte`:

```svelte
<script lang="ts">
	import { invalidateAll, goto } from '$app/navigation';

	let { data } = $props();

	let showCourseForm = $state(false);
	let courseTitle = $state('');
	let courseDesc = $state('');
	let ageMin = $state(6);
	let ageMax = $state(12);
	let maxParticipants = $state(20);
	let submitting = $state(false);

	async function addCourse(e: SubmitEvent) {
		e.preventDefault();
		submitting = true;

		const res = await fetch('/api/courses', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				arrangementId: data.event.arrangementId,
				title: courseTitle,
				description: courseDesc,
				ageMin,
				ageMax,
				maxParticipants
			})
		});

		if (res.ok) {
			showCourseForm = false;
			courseTitle = courseDesc = '';
			ageMin = 6; ageMax = 12; maxParticipants = 20;
			invalidateAll();
		}
		submitting = false;
	}

	async function toggleCancelled() {
		await fetch(`/api/events/${data.event.arrangementId}`, {
			method: 'PATCH',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ cancelled: !data.event.cancelled })
		});
		invalidateAll();
	}

	async function deleteEvent() {
		if (!confirm('Er du sikker på at du vil slette dette arrangementet?')) return;
		const res = await fetch(`/api/events/${data.event.arrangementId}`, { method: 'DELETE' });
		if (res.ok) goto('/admin/arrangementer');
	}

	async function deleteCourse(courseId: string) {
		if (!confirm('Slette dette kurset?')) return;
		const res = await fetch(`/api/courses/${courseId}`, { method: 'DELETE' });
		if (res.ok) invalidateAll();
		else alert('Kan ikke slette kurs med aktive påmeldinger');
	}
</script>

<a href="/admin/arrangementer" class="back-link">&larr; Tilbake</a>

<div class="header-row">
	<h1>{data.event.title}</h1>
	<div class="actions">
		<button class="btn btn-outline" onclick={toggleCancelled}>
			{data.event.cancelled ? 'Gjenåpne' : 'Avlys'}
		</button>
		<button class="btn btn-outline danger" onclick={deleteEvent}>Slett</button>
	</div>
</div>

<h2>Kurs</h2>
<button class="btn btn-primary btn-sm" onclick={() => showCourseForm = !showCourseForm}>
	{showCourseForm ? 'Avbryt' : 'Legg til kurs'}
</button>

{#if showCourseForm}
	<form class="card form-card" onsubmit={addCourse}>
		<div class="form-group">
			<label for="cTitle">Tittel</label>
			<input id="cTitle" bind:value={courseTitle} required />
		</div>
		<div class="form-group">
			<label for="cDesc">Beskrivelse</label>
			<textarea id="cDesc" bind:value={courseDesc} rows="2" required></textarea>
		</div>
		<div class="form-row">
			<div class="form-group">
				<label for="ageMin">Min alder</label>
				<input id="ageMin" type="number" bind:value={ageMin} min="3" max="18" required />
			</div>
			<div class="form-group">
				<label for="ageMax">Maks alder</label>
				<input id="ageMax" type="number" bind:value={ageMax} min="3" max="18" required />
			</div>
			<div class="form-group">
				<label for="maxP">Maks deltakere</label>
				<input id="maxP" type="number" bind:value={maxParticipants} min="1" required />
			</div>
		</div>
		<button type="submit" class="btn btn-primary" disabled={submitting}>Legg til</button>
	</form>
{/if}

<div class="courses-list">
	{#each data.courses as course}
		<div class="card course-row">
			<div>
				<strong>{course.title}</strong>
				<span class="meta">{course.ageMin}–{course.ageMax} år | {course.confirmedCount}/{course.maxParticipants} påmeldt</span>
			</div>
			<button class="btn btn-outline btn-sm danger" onclick={() => deleteCourse(course.courseId)}>Slett</button>
		</div>
	{/each}
</div>

<style>
	.back-link {
		display: inline-block;
		margin-bottom: 1rem;
		color: var(--color-text-muted);
	}

	.header-row {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 2rem;
		flex-wrap: wrap;
		gap: 1rem;
	}

	.actions { display: flex; gap: 0.5rem; }

	h2 { margin: 2rem 0 0.75rem; }

	.form-card { margin: 1rem 0; padding: 1.5rem; }

	.form-row {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 1rem;
	}

	.courses-list {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		margin-top: 1rem;
	}

	.course-row {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.meta {
		display: block;
		color: var(--color-text-muted);
		font-size: 0.85rem;
	}

	.danger {
		border-color: var(--color-error);
		color: var(--color-error);
	}

	.danger:hover {
		background: var(--color-error);
		color: white;
	}
</style>
```

- [ ] **Step 8: Commit**

```bash
git add .
git commit -m "feat: add admin dashboard and event/course management"
```

---

## Task 10: Admin Panel — Registrations and CSV Export

**Files:**
- Create: `src/routes/admin/pameldinger/+page.server.ts`, `src/routes/admin/pameldinger/+page.svelte`, `src/routes/api/registrations/[registrationId]/+server.ts`, `src/routes/api/admin/export/[courseId]/+server.ts`

- [ ] **Step 1: Create admin registrations server load**

Create `src/routes/admin/pameldinger/+page.server.ts`:

```ts
import { db } from '$lib/server/db';
import { registrations, courses, events } from '$lib/server/db/schema';
import { eq, desc } from 'drizzle-orm';

export async function load({ url }) {
	const statusFilter = url.searchParams.get('status');

	const allRegistrations = await db
		.select({
			registration: registrations,
			courseTitle: courses.title,
			eventTitle: events.title,
			courseId: courses.courseId
		})
		.from(registrations)
		.innerJoin(courses, eq(registrations.courseId, courses.courseId))
		.innerJoin(events, eq(courses.arrangementId, events.arrangementId))
		.orderBy(desc(registrations.createdAt));

	const filtered = statusFilter
		? allRegistrations.filter((r) => r.registration.status === statusFilter)
		: allRegistrations;

	const allCourses = await db
		.select({ courseId: courses.courseId, title: courses.title, eventTitle: events.title })
		.from(courses)
		.innerJoin(events, eq(courses.arrangementId, events.arrangementId));

	return { registrations: filtered, courses: allCourses, statusFilter };
}
```

- [ ] **Step 2: Create admin registrations page**

Create `src/routes/admin/pameldinger/+page.svelte`:

```svelte
<script lang="ts">
	import { invalidateAll, goto } from '$app/navigation';
	import { page } from '$app/state';

	let { data } = $props();

	function filterByStatus(status: string | null) {
		const url = new URL(page.url);
		if (status) url.searchParams.set('status', status);
		else url.searchParams.delete('status');
		goto(url.toString());
	}

	async function cancelRegistration(registrationId: string) {
		if (!confirm('Avbestille denne påmeldingen?')) return;
		await fetch(`/api/registrations/${registrationId}`, {
			method: 'PATCH',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ status: 'cancelled' })
		});
		invalidateAll();
	}
</script>

<h1>Påmeldinger</h1>

<div class="filters">
	<button class="btn btn-sm" class:active={!data.statusFilter} onclick={() => filterByStatus(null)}>Alle</button>
	<button class="btn btn-sm" class:active={data.statusFilter === 'confirmed'} onclick={() => filterByStatus('confirmed')}>Bekreftet</button>
	<button class="btn btn-sm" class:active={data.statusFilter === 'waitlisted'} onclick={() => filterByStatus('waitlisted')}>Venteliste</button>
	<button class="btn btn-sm" class:active={data.statusFilter === 'cancelled'} onclick={() => filterByStatus('cancelled')}>Avbestilt</button>
</div>

{#if data.courses.length > 0}
	<div class="export-section">
		<label for="exportCourse">Eksporter CSV:</label>
		<select id="exportCourse" onchange={(e) => {
			const val = e.currentTarget.value;
			if (val) window.open(`/api/admin/export/${val}`, '_blank');
		}}>
			<option value="">Velg kurs...</option>
			{#each data.courses as c}
				<option value={c.courseId}>{c.eventTitle} — {c.title}</option>
			{/each}
		</select>
	</div>
{/if}

<div class="table-wrap">
	<table>
		<thead>
			<tr>
				<th>Barn</th>
				<th>Alder</th>
				<th>Foresatt</th>
				<th>E-post</th>
				<th>Kurs</th>
				<th>Status</th>
				<th></th>
			</tr>
		</thead>
		<tbody>
			{#each data.registrations as r}
				<tr>
					<td>{r.registration.childName}</td>
					<td>{r.registration.childAge}</td>
					<td>{r.registration.parentName}</td>
					<td>{r.registration.parentEmail}</td>
					<td>{r.courseTitle}</td>
					<td>
						{#if r.registration.status === 'confirmed'}
							<span class="badge badge-success">Bekreftet</span>
						{:else if r.registration.status === 'waitlisted'}
							<span class="badge badge-warning">Venteliste ({r.registration.waitlistPosition})</span>
						{:else}
							<span class="badge badge-error">Avbestilt</span>
						{/if}
					</td>
					<td>
						{#if r.registration.status !== 'cancelled'}
							<button class="btn btn-outline btn-sm danger" onclick={() => cancelRegistration(r.registration.registrationId)}>Avbestill</button>
						{/if}
					</td>
				</tr>
			{/each}
		</tbody>
	</table>
</div>

<style>
	h1 { margin-bottom: 1.5rem; }

	.filters {
		display: flex;
		gap: 0.5rem;
		margin-bottom: 1.5rem;
	}

	.filters .btn {
		padding: 0.4rem 1rem;
		font-size: 0.85rem;
		border: 1px solid var(--color-border);
		background: transparent;
		color: var(--color-text-muted);
		border-radius: var(--radius);
		cursor: pointer;
	}

	.filters .btn.active {
		background: var(--color-heading);
		color: var(--color-bg-deep);
		border-color: var(--color-heading);
	}

	.export-section {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		margin-bottom: 1.5rem;
	}

	.export-section select {
		width: auto;
		min-width: 250px;
	}

	.table-wrap {
		overflow-x: auto;
	}

	table {
		width: 100%;
		border-collapse: collapse;
	}

	th, td {
		padding: 0.75rem;
		text-align: left;
		border-bottom: 1px solid var(--color-border);
	}

	th {
		color: var(--color-text-muted);
		font-size: 0.85rem;
		font-weight: 600;
	}

	.danger {
		border-color: var(--color-error);
		color: var(--color-error);
	}
</style>
```

- [ ] **Step 3: Create admin registration PATCH route**

Create `src/routes/api/registrations/[registrationId]/+server.ts`:

```ts
import { json, error } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { registrations, courses, events } from '$lib/server/db/schema';
import { eq, and, asc, sql } from 'drizzle-orm';
import { validateSession } from '$lib/server/auth';
import { sendCancellationEmail, sendPromotionEmail } from '$lib/server/email';

export async function PATCH({ params, request, cookies }) {
	const adminUserId = await validateSession(cookies);
	if (!adminUserId) throw error(401, 'Ikke autorisert');

	const body = await request.json();

	const [registration] = await db
		.select()
		.from(registrations)
		.where(eq(registrations.registrationId, params.registrationId));

	if (!registration) throw error(404, 'Påmelding ikke funnet');

	if (body.status === 'cancelled' && registration.status !== 'cancelled') {
		const wasConfirmed = registration.status === 'confirmed';

		await db
			.update(registrations)
			.set({ status: 'cancelled', waitlistPosition: null })
			.where(eq(registrations.registrationId, params.registrationId));

		const [course] = await db.select().from(courses).where(eq(courses.courseId, registration.courseId));
		const [event] = await db.select().from(events).where(eq(events.arrangementId, course.arrangementId));

		try {
			await sendCancellationEmail({
				parentEmail: registration.parentEmail,
				parentName: registration.parentName,
				childName: registration.childName,
				courseTitle: course.title
			});
		} catch (e) {
			console.error('Failed to send cancellation email:', e);
		}

		if (wasConfirmed) {
			const [next] = await db
				.select()
				.from(registrations)
				.where(and(eq(registrations.courseId, registration.courseId), eq(registrations.status, 'waitlisted')))
				.orderBy(asc(registrations.waitlistPosition))
				.limit(1);

			if (next) {
				await db
					.update(registrations)
					.set({ status: 'confirmed', waitlistPosition: null })
					.where(eq(registrations.registrationId, next.registrationId));

				await db.execute(
					sql`UPDATE registrations SET "waitlistPosition" = "waitlistPosition" - 1 WHERE "courseId" = ${registration.courseId} AND status = 'waitlisted' AND "waitlistPosition" IS NOT NULL`
				);

				try {
					await sendPromotionEmail({
						parentEmail: next.parentEmail,
						parentName: next.parentName,
						childName: next.childName,
						courseTitle: course.title,
						eventTitle: event.title,
						eventDate: new Date(event.date).toLocaleDateString('nb-NO')
					});
				} catch (e) {
					console.error('Failed to send promotion email:', e);
				}
			}
		}
	}

	return json({ success: true });
}
```

- [ ] **Step 4: Create CSV export route**

Create `src/routes/api/admin/export/[courseId]/+server.ts`:

```ts
import { error } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { registrations, courses } from '$lib/server/db/schema';
import { eq, ne } from 'drizzle-orm';
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
```

- [ ] **Step 5: Run all tests**

```bash
npx vitest run
```

- [ ] **Step 6: Commit**

```bash
git add .
git commit -m "feat: add admin registration management and CSV export"
```

---

## Task 11: Final Integration and Polish

**Files:**
- Modify: various files for final tweaks

- [ ] **Step 1: Add vitest config to vite.config.ts**

Ensure `vite.config.ts` includes:

```ts
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';

export default defineConfig({
	plugins: [sveltekit()],
	test: {
		include: ['src/**/*.{test,spec}.{js,ts}']
	}
});
```

- [ ] **Step 2: Verify full application flow**

```bash
docker compose up -d db
npm run db:migrate
npm run db:seed
npm run dev
```

Test manually:
1. Visit `/` — landing page with seeded event
2. Visit `/arrangementer` — events list
3. Click into event → see courses
4. Click "Meld på" → fill form → submit
5. Visit `/admin/login` → log in
6. Visit `/admin` → dashboard stats
7. Visit `/admin/arrangementer` → see events, create new
8. Visit `/admin/pameldinger` → see registrations, filter, export CSV

- [ ] **Step 3: Run all tests**

```bash
npx vitest run
```

- [ ] **Step 4: Final commit**

```bash
git add .
git commit -m "chore: finalize integration and polish"
```
