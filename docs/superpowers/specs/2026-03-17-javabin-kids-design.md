# javaBin Kids - Design Specification

## Overview

A website for javaBin Kids - coding events for children organized by javaBin in connection with the JavaZone conference. The site presents events (past and upcoming), handles course registration with waitlists, and provides an admin panel for organizers.

**Stack:** SvelteKit 2, Svelte 5, Drizzle ORM, PostgreSQL, Resend, Docker Compose

## Data Model

All table names are plural, column names use camelCase.

### events
| Column | Type | Description |
|--------|------|-------------|
| arrangementId | uuid (PK) | Primary key |
| title | text | Event title |
| description | text | Event description |
| date | timestamp | Event date |
| location | text | Venue |
| cancelled | boolean | Whether event is cancelled (default false) |
| registrationOpens | timestamp | When registration opens |
| registrationCloses | timestamp | When registration closes |
| imageUrl | text (nullable) | Hero image URL |
| createdAt | timestamp | Creation timestamp |
| updatedAt | timestamp | Last updated |

Event status ("upcoming" / "past") is derived at query time from `date` relative to now. Only `cancelled` is stored as an override.

### courses
| Column | Type | Description |
|--------|------|-------------|
| courseId | uuid (PK) | Primary key |
| arrangementId | uuid (FK → events) | Parent event |
| title | text | Course/activity title |
| description | text | Course description |
| ageMin | integer | Minimum age |
| ageMax | integer | Maximum age |
| maxParticipants | integer | Capacity |
| createdAt | timestamp | Creation timestamp |
| updatedAt | timestamp | Last updated |

### registrations
| Column | Type | Description |
|--------|------|-------------|
| registrationId | uuid (PK) | Primary key |
| courseId | uuid (FK → courses) | Target course |
| parentName | text | Parent/guardian name |
| parentEmail | text | Parent/guardian email |
| parentPhone | text | Parent/guardian phone |
| childName | text | Child's name |
| childAge | integer | Child's age |
| status | text | "confirmed" / "waitlisted" / "cancelled" |
| waitlistPosition | integer (nullable) | Position on waitlist, null if confirmed |
| cancellationToken | uuid | Token for self-service cancellation via email link |
| createdAt | timestamp | Registration timestamp |
| updatedAt | timestamp | Last updated |

**Constraints:**
- Unique on (courseId, parentEmail, childName) to prevent duplicate registrations (allows same parent to register multiple children)
- childAge must be between course's ageMin and ageMax
- On course deletion: soft-delete not cascaded; courses with registrations cannot be deleted

### adminUsers
| Column | Type | Description |
|--------|------|-------------|
| adminUserId | uuid (PK) | Primary key |
| username | text (unique) | Login username |
| passwordHash | text | bcrypt hash |
| createdAt | timestamp | Creation timestamp |

### sessions
| Column | Type | Description |
|--------|------|-------------|
| sessionId | uuid (PK) | Session token (stored in cookie) |
| adminUserId | uuid (FK → adminUsers) | Owning admin |
| expiresAt | timestamp | Session expiry |
| createdAt | timestamp | Creation timestamp |

## Registration Flow

1. User browses events → selects a course
2. Fills in form: child's name, age, parent's name, email, phone
3. Validation (via Zod):
   - Registration period is open
   - Child's age matches course age range
   - No duplicate registration (same email + childName + course)
4. Seat allocation uses a database transaction with row-level locking (`SELECT ... FOR UPDATE` on the course row) to prevent race conditions
5. If seats available → status "confirmed", confirmation email sent (includes cancellation link)
6. If full → status "waitlisted", waitlist email with position sent (includes cancellation link)
7. On cancellation (via admin or self-service cancellation link):
   - Registration marked as "cancelled"
   - Next waitlisted person (lowest waitlistPosition) is promoted to "confirmed"
   - All remaining waitlist positions are decremented
   - Promoted person receives notification email

## Email Notifications (via Resend)

- Registration confirmation (with cancellation link)
- Waitlist confirmation with position (with cancellation link)
- Promotion from waitlist to confirmed
- Cancellation confirmation

## Pages and Routing

### Public Pages

| Route | Description |
|-------|-------------|
| `/` | Landing page with hero, next upcoming event, about summary |
| `/arrangementer` | List of all events (upcoming first, then past) |
| `/arrangementer/[arrangementId]` | Event detail with list of courses |
| `/arrangementer/[arrangementId]/pamelding/[courseId]` | Registration form for a course |
| `/om` | About javaBin Kids |
| `/kontakt` | Contact information |

Public pages use SvelteKit `+page.server.ts` load functions to fetch data directly from the database (no API routes needed for reads).

### Admin Pages

| Route | Description |
|-------|-------------|
| `/admin/login` | Admin login |
| `/admin` | Dashboard with overview |
| `/admin/arrangementer` | Manage events |
| `/admin/arrangementer/[arrangementId]` | Edit event + courses |
| `/admin/pameldinger` | View registrations, manage waitlist, export CSV |

### API Routes

| Route | Method | Description |
|-------|--------|-------------|
| `/api/auth/login` | POST | Admin login, creates session |
| `/api/auth/logout` | POST | Admin logout, destroys session |
| `/api/registrations` | GET | List registrations (admin, filterable) |
| `/api/registrations` | POST | Create registration (public, rate-limited) |
| `/api/registrations/[registrationId]/cancel` | POST | Cancel via cancellationToken (public) |
| `/api/registrations/[registrationId]` | PATCH | Update registration (admin) |
| `/api/events` | POST | Create event (admin) |
| `/api/events/[arrangementId]` | PATCH/DELETE | Update/delete event (admin) |
| `/api/courses` | POST | Create course (admin) |
| `/api/courses/[courseId]` | PATCH/DELETE | Update/delete course (admin) |
| `/api/admin/export/[courseId]` | GET | Export CSV of registrations (admin) |

All admin API routes are protected by session auth middleware. Public POST endpoints are rate-limited.

## Input Validation

All user input is validated with Zod schemas on the server side. This includes:
- Registration form fields (names, email format, phone format, age range)
- Admin form fields (event/course data)
- API request bodies

## Security

- **CSRF:** SvelteKit's built-in CSRF protection for form actions. API routes validate Origin header.
- **Rate limiting:** In-memory rate limiter on `POST /api/registrations` (e.g., 5 requests per minute per IP).
- **Auth guard:** All `/api/events`, `/api/courses`, `/api/registrations` (GET/PATCH), `/api/admin/*` routes check for valid session cookie.
- **Cancellation:** Self-service cancellation uses an unguessable UUID token, not the registration ID.

## Visual Design

Inspired by JavaZone 2026's underwater theme, adapted for children.

### Color Palette
- Background: Dark teal gradient (`#1a2f3a` → `#0d1b2a`)
- Headings: Light cyan/turquoise (`#7ec8c8`)
- Accent/buttons: Golden/sand (`#d4a843`) with dark border
- Body text: Light (`#e8e8e8`)
- Status: Green for confirmed, yellow for waitlisted

### Design Elements
- CSS-animated bubbles as background elements
- Rounded corners, soft shapes (child-friendly)
- Larger text and buttons than adult version
- Card-based layout for events and courses
- Responsive design (mobile-first)
- Sticky navigation bar

### Navigation
```
javaBin Kids   Arrangementer   Om   Kontakt        [Admin]
```

### Footer
```
Made by javaBin   Code of conduct
```

## Project Structure

```
javaBinKids/
├── docker-compose.yml
├── Dockerfile
├── drizzle.config.ts
├── drizzle/
│   └── migrations/
├── src/
│   ├── lib/
│   │   ├── server/
│   │   │   ├── db/
│   │   │   │   ├── index.ts
│   │   │   │   └── schema.ts
│   │   │   ├── auth.ts
│   │   │   ├── email.ts
│   │   │   └── validation.ts       # Zod schemas
│   │   ├── components/
│   │   │   ├── Nav.svelte
│   │   │   ├── EventCard.svelte
│   │   │   ├── CourseCard.svelte
│   │   │   ├── RegistrationForm.svelte
│   │   │   └── Bubbles.svelte
│   │   └── types.ts
│   ├── routes/
│   │   ├── +layout.svelte
│   │   ├── +error.svelte            # Error page
│   │   ├── +page.svelte
│   │   ├── arrangementer/
│   │   │   ├── +page.server.ts
│   │   │   ├── +page.svelte
│   │   │   └── [arrangementId]/
│   │   │       ├── +page.server.ts
│   │   │       ├── +page.svelte
│   │   │       └── pamelding/
│   │   │           └── [courseId]/
│   │   │               ├── +page.server.ts
│   │   │               └── +page.svelte
│   │   ├── om/+page.svelte
│   │   ├── kontakt/+page.svelte
│   │   ├── admin/
│   │   │   ├── +layout.server.ts    # Auth guard
│   │   │   ├── +page.svelte
│   │   │   ├── login/+page.svelte
│   │   │   ├── arrangementer/
│   │   │   │   ├── +page.svelte
│   │   │   │   └── [arrangementId]/+page.svelte
│   │   │   └── pameldinger/
│   │   │       └── +page.svelte
│   │   └── api/
│   │       ├── auth/
│   │       │   ├── login/+server.ts
│   │       │   └── logout/+server.ts
│   │       ├── registrations/
│   │       │   ├── +server.ts
│   │       │   └── [registrationId]/
│   │       │       ├── +server.ts
│   │       │       └── cancel/+server.ts
│   │       ├── events/
│   │       │   ├── +server.ts
│   │       │   └── [arrangementId]/+server.ts
│   │       ├── courses/
│   │       │   ├── +server.ts
│   │       │   └── [courseId]/+server.ts
│   │       └── admin/
│   │           └── export/[courseId]/+server.ts
│   └── app.css
├── static/
│   └── fonts/
├── package.json
└── seed.ts
```

## Dependencies

- `svelte`, `@sveltejs/kit`, `@sveltejs/adapter-node`
- `drizzle-orm`, `drizzle-kit`, `postgres`
- `resend`
- `bcrypt`
- `zod`

## Admin Panel

- Cookie-based session authentication (sessions table in DB)
- No self-registration; admin users created via seed script
- CRUD for events and courses
- View/filter registrations by status
- Manual cancellation (triggers waitlist promotion)
- CSV export of registration lists
- Dashboard with event overview and capacity stats

## Docker Compose

- PostgreSQL service with persistent volume
- Application service with Node.js
- Environment variables for DB connection, Resend API key, admin seed credentials

## Database Migrations

Managed by `drizzle-kit`. Migration SQL files stored in `drizzle/migrations/`. Run via `npx drizzle-kit migrate`.
