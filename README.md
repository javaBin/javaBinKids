# javaBin Kids

Nettside for javaBin Kids — kode-arrangementer for barn i regi av [javaBin](https://java.no), i forbindelse med [JavaZone](https://javazone.no)-konferansen.

Nettsiden presenterer arrangementer, håndterer påmelding med venteliste, og har et admin-panel for arrangørene.

## Tech stack

| Lag | Teknologi |
|-----|-----------|
| Frontend | [SvelteKit 2](https://svelte.dev/docs/kit) + [Svelte 5](https://svelte.dev) (runes) |
| Backend | SvelteKit server routes (`+page.server.ts`, `+server.ts`) |
| Database | PostgreSQL 17 via [Drizzle ORM](https://orm.drizzle.team) |
| Validering | [Zod](https://zod.dev) |
| E-post | [SendGrid](https://sendgrid.com) |
| Markdown | [marked](https://marked.js.org) (kursbeskrivelser) |
| Auth | Cookie-basert sesjoner med bcrypt |
| Infra | Docker Compose (dev + backup) |

## Kom i gang

### Forutsetninger

- [Docker](https://docker.com) og Docker Compose
- Node.js 22+ (for lokal utvikling uten Docker)

### Med Docker (anbefalt)

```bash
# Start alt
docker compose up -d

# Kjør migrering og seed
docker compose exec app npx drizzle-kit migrate
docker compose exec app npx tsx seed.ts

# Appen kjører på http://localhost:5175
```

### Uten Docker

```bash
# Forutsetter en kjørende PostgreSQL-instans
cp .env.example .env
# Rediger .env med din DATABASE_URL

npm install
npm run db:migrate
npm run db:seed
npm run dev
```

### Miljøvariabler

Se `.env.example`:

| Variabel | Beskrivelse |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `SENDGRID_API_KEY` | API-nøkkel fra [sendgrid.com](https://sendgrid.com) |
| `ADMIN_USERNAME` | Brukernavn for admin (brukes av seed) |
| `ADMIN_PASSWORD` | Passord for admin (brukes av seed) |
| `BASE_URL` | Offentlig URL for e-postlenker |
| `EMAIL_SUBJECT_PREFIX` | (Valgfritt) Prefix som legges til alle e-post-emnelinjer. Nyttig for å skille test-e-poster fra produksjon, f.eks. `[DEV] `. |

## Prosjektstruktur

```
src/
├── lib/
│   ├── server/
│   │   ├── db/
│   │   │   ├── schema.ts        # Drizzle-skjema (alle tabeller)
│   │   │   └── index.ts         # DB-tilkobling
│   │   ├── ...                  # Komponenter og utils for server-side (validering, auth, e-post)
│   ├── components/
│   │   ├── ...                  # Frontend komponenter
│   └── toast.svelte.ts          # Toast state management
├── routes/
│   ├── ...                      # Offentlige sider
│   ├── admin/                   # Admin-panel (auth-beskyttet)
│   └── api/                     # API-ruter levert av SvelteKit
└── app.css                      # Globale stiler (undervanns-tema)
```

## Database

### Tabeller

Drizzle-skjemaet ligger i `src/lib/server/db/schema.ts`. Alle `timestamp`-kolonner lagres uten tidssone, alle UUID-kolonner er `gen_random_uuid()`-defaulted der ikke annet er spesifisert.

#### `events`

Arrangementer — én rad per javaBin Kids-dag (f.eks. "javaBin Kids Vår 2026"). Kurs og forslag henger under et arrangement.

| Kolonne | Type | Beskrivelse |
|---|---|---|
| `arrangementId` | uuid, PK | Unik ID |
| `title` | text | Visningstittel |
| `description` | text | Markdown-beskrivelse |
| `date` | timestamp | Dato for arrangementet |
| `location` | text | Sted/adresse |
| `cancelled` | boolean | Om arrangementet er avlyst |
| `registrationOpens` | timestamp | Start for påmelding |
| `registrationCloses` | timestamp | Slutt for påmelding |
| `imageUrl` | text, nullable | URL til forsidebilde (fra `images`-tabellen eller ekstern) |
| `openForSubmissions` | boolean | Om åpent for innsending av kursforslag |
| `submissionDeadline` | timestamp, nullable | Frist for innsending av forslag |
| `createdAt`, `updatedAt` | timestamp | Auto |

#### `courses`

Kurs som arrangeres innenfor et gitt arrangement. Hvert kurs har egen alders- og kapasitetsgrense.

| Kolonne | Type | Beskrivelse |
|---|---|---|
| `courseId` | uuid, PK | Unik ID |
| `arrangementId` | uuid, FK → `events` | Hvilket arrangement kurset tilhører (`ON DELETE RESTRICT`) |
| `title` | text | Kurstittel |
| `introduction` | text | Kort introduksjonstekst |
| `description` | text | Fullstendig Markdown-beskrivelse |
| `thumbnailUrl` | text, nullable | URL til thumbnail |
| `ageMin`, `ageMax` | integer | Aldersgruppe (inkluderende) |
| `maxParticipants` | integer | Maks antall påmeldte før venteliste |
| `createdAt`, `updatedAt` | timestamp | Auto |

#### `submissions`

Kursforslag sendt inn av eksterne foredragsholdere via forslagsskjemaet. Går gjennom admin-vurdering (`submitted` → `approved`/`rejected`).

| Kolonne | Type | Beskrivelse |
|---|---|---|
| `submissionId` | uuid, PK | Unik ID |
| `arrangementId` | uuid, FK → `events` | Hvilket arrangement forslaget er sendt til |
| `status` | text | `submitted`, `approved` eller `rejected` |
| `title` | text | Kurstittel |
| `description` | text | Markdown-beskrivelse |
| `equipmentRequirements` | text, nullable | Utstyrsbehov |
| `ageMin`, `ageMax` | integer | Foreslått aldersgruppe |
| `maxParticipants` | integer | Foreslått maks antall |
| `speakerName` | text | Foredragsholders navn |
| `speakerEmail` | text | E-post (brukes til mottatt/godkjent/avvist-mail) |
| `speakerBio` | text | Kort bio |
| `editToken` | uuid | Token i redigeringslenke, lar foredragsholder endre forslaget uten innlogging |
| `createdAt`, `updatedAt` | timestamp | Auto |

#### `registrations`

Påmeldinger fra foreldre til et spesifikt kurs. Unik på `(courseId, parentEmail, childName)` for å hindre duplikater.

| Kolonne | Type | Beskrivelse |
|---|---|---|
| `registrationId` | uuid, PK | Unik ID |
| `courseId` | uuid, FK → `courses` | Kurset barnet meldes på |
| `parentName` | text | Forelders navn |
| `parentEmail` | text | E-post (brukes til bekreftelse/påminnelse) |
| `parentPhone` | text | Telefonnummer |
| `childName` | text | Barnets navn |
| `childAge` | integer | Barnets alder |
| `status` | text | `confirmed`, `waitlisted` eller `cancelled` |
| `waitlistPosition` | integer, nullable | Posisjon på venteliste (1 = først i køen); `null` for confirmed/cancelled |
| `consentGiven` | boolean | Om samtykke til databehandling er gitt |
| `cancellationToken` | uuid | Token i bekreftelse/avmeldings-lenke — gjør at forelder kan avmelde uten innlogging |
| `createdAt`, `updatedAt` | timestamp | Auto |

#### `adminUsers`

Admin-brukere som kan logge inn i admin-panelet. Opprettes via `npm run db:seed`.

| Kolonne | Type | Beskrivelse |
|---|---|---|
| `adminUserId` | uuid, PK | Unik ID |
| `username` | text, unique | Brukernavn |
| `passwordHash` | text | bcrypt-hash av passord |
| `createdAt` | timestamp | Auto |

#### `sessions`

Aktive admin-sesjoner. Sesjons-ID-en lagres som HTTP-cookie og valideres på hver admin-request.

| Kolonne | Type | Beskrivelse |
|---|---|---|
| `sessionId` | uuid, PK | ID som lagres i cookien |
| `adminUserId` | uuid, FK → `adminUsers` | Hvilken bruker sesjonen tilhører |
| `expiresAt` | timestamp | Utløp (typisk 24 timer etter innlogging) |
| `createdAt` | timestamp | Auto |

#### `siteContent`

Nøkkel/verdi-tekst som admin kan redigere fra `/admin/innhold`. Brukes for forside-hero, om-siden osv.

| Kolonne | Type | Beskrivelse |
|---|---|---|
| `key` | text, PK | Identifikator, f.eks. `hero_title`, `om_content` |
| `content` | text | Fritekst/Markdown |
| `updatedAt` | timestamp | Auto |

#### `images`

Binær-lagring av opplastede bilder (thumbnails, forsidebilder). Serveres via `/api/images/{imageId}` som bruker `mimeType` som `Content-Type`.

| Kolonne | Type | Beskrivelse |
|---|---|---|
| `imageId` | uuid, PK | Unik ID (del av serve-URL) |
| `filename` | text | Opprinnelig filnavn |
| `mimeType` | text | `image/jpeg`, `image/png`, osv. |
| `data` | bytea | Rå bilde-bytes |
| `createdAt` | timestamp | Auto |

#### `emailTemplates`

Redigerbare e-postmaler for de åtte transaksjonelle e-postene (bekreftelse, venteliste, forslag-godkjent, osv.). Hvis en rad mangler eller et felt er tomt, faller `email.ts` tilbake på hardkodet default. Tekstfelter kan inneholde `{{variabel}}`-plassholdere og `**fet tekst**`.

| Kolonne | Type | Beskrivelse |
|---|---|---|
| `templateKey` | text, PK | Én av `confirmation`, `waitlist`, `promotion`, `cancellation`, `reminder`, `submissionReceived`, `submissionApproved`, `submissionRejected` |
| `subject` | text | Emnelinje |
| `heading` | text | Overskrift i e-post-kroppen |
| `introText` | text | Paragrafer før info-bokser (tom linje = ny paragraf) |
| `outroText` | text | Paragrafer etter knapp/info-bokser |
| `buttonText` | text, nullable | CTA-knappens tekst (kun for maler med knapp) |
| `updatedAt` | timestamp | Auto |

#### `contactCards`

Kontaktkort som vises på kontaktsiden, administreres fra `/admin/innhold`.

| Kolonne | Type | Beskrivelse |
|---|---|---|
| `contactCardId` | uuid, PK | Unik ID |
| `title` | text | Kort-tittel |
| `actionType` | text | `email`, `link` eller `phone` |
| `actionValue` | text | E-post, URL eller telefonnummer |
| `sortOrder` | integer | Visningsrekkefølge (stigende) |
| `createdAt`, `updatedAt` | timestamp | Auto |

### Migreringer

Drizzle Kit håndterer migreringer. SQL-filer ligger i `drizzle/migrations/`.

```bash
# Generer ny migrering etter skjemaendring
npm run db:generate

# Kjør migreringer
npm run db:migrate
```

### Seed

`seed.ts` oppretter en admin-bruker og et eksempel-arrangement med kurs:

```bash
npm run db:seed
```

## Viktige konsepter

### Påmeldingsflyt

1. Bruker velger kurs og fyller ut skjema
2. Server validerer (Zod), sjekker duplikat, sjekker kapasitet
3. Plassering skjer i en DB-transaksjon med `SELECT ... FOR UPDATE` (row-level locking)
4. Hvis plass: `confirmed`, ellers: `waitlisted` med posisjon
5. E-postbekreftelse sendes (med kanselleringslenke)

### Venteliste

- Ved kansellering rykker neste person på ventelisten opp automatisk
- Alle gjenværende ventelisteposisjoner dekrementeres
- Den opprykkte personen får e-post

### Admin-autentisering

- Cookie-basert sesjoner lagret i `sessions`-tabellen
- Sesjoner utløper etter 24 timer
- `+layout.server.ts` under `/admin` sjekker sesjon og redirecter til login
- Alle admin API-ruter validerer sesjon

### Typesikkerhet

- Drizzle ORM gir type-safe database-tilgang
- SvelteKit genererer `PageData`-typer fra `+page.server.ts` load-funksjoner
- Alle sider importerer `PageData` fra `./$types`
- Zod validerer all bruker-input på serveren

### Visuelt design

Inspirert av JavaZone 2026 sitt undervanns-tema:
- Mørk blågrønn gradient bakgrunn
- Turkise overskrifter, gylne aksenter
- Animerte bobler med interaktiv fiskefigur (poengteller i localStorage)
- Responsivt, mobil-først design

## Tester

```bash
npx vitest run
```

Tester dekker:
- Zod-validering (`validation.test.ts`)
- Rate limiter (`rateLimit.test.ts`)
- Påmeldingslogikk (`registration.test.ts`)

## Backup

Backup-containeren kjører automatisk som en del av Docker Compose.

### Automatisk backup

- Kjører `pg_dump | gzip` daglig kl. 03:00
- Lagres til Docker-volumet `backups`
- Backups eldre enn 14 dager slettes automatisk (konfigurerbart via `BACKUP_KEEP_DAYS`)

### Manuell backup

```bash
docker compose exec backup bash -c \
  'pg_dump | gzip > /backups/javabinkids-manual-$(date +%Y%m%d-%H%M%S).sql.gz'
```

### Se eksisterende backups

```bash
docker compose exec backup ls -lh /backups/
```

### Restore

```bash
# Finn ønsket backup
docker compose exec backup ls -lh /backups/

# Restore (erstatter all data i databasen)
docker compose exec backup bash -c \
  'gunzip -c /backups/javabinkids-XXXXXXXX-XXXXXX.sql.gz | psql'
```

### Se backup-logger

```bash
docker compose logs backup
```

## Produksjon

Prosjektet inkluderer en `Dockerfile` for produksjonsbygg med multi-stage build:

```bash
docker build -t javabinkids .
docker run -p 3000:3000 \
  -e DATABASE_URL=postgres://... \
  -e SENDGRID_API_KEY=SG.... \
  -e BASE_URL=https://kids.javabin.no \
  javabinkids
```

## npm scripts

| Script | Beskrivelse |
|--------|-------------|
| `npm run dev` | Start dev-server |
| `npm run build` | Produksjonsbygg |
| `npm run preview` | Forhåndsvis produksjonsbygg |
| `npm run check` | TypeScript type-checking |
| `npm run db:generate` | Generer Drizzle-migrering |
| `npm run db:migrate` | Kjør migreringer |
| `npm run db:seed` | Seed database |
