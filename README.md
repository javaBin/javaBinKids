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
| E-post | [Resend](https://resend.com) |
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
| `RESEND_API_KEY` | API-nøkkel fra [resend.com](https://resend.com) |
| `ADMIN_USERNAME` | Brukernavn for admin (brukes av seed) |
| `ADMIN_PASSWORD` | Passord for admin (brukes av seed) |
| `BASE_URL` | Offentlig URL for e-postlenker |

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

| Tabell          | Beskrivelse |
|-----------------|-------------|
| `events`        | Arrangementer med dato, sted, registreringsperiode |
| `courses`       | Kurs innenfor et arrangement (aldersgruppe, kapasitet) |
| `registrations` | Påmeldinger med status (confirmed/waitlisted/cancelled) |
| `adminUsers`    | Admin-brukere (opprettet via seed) |
| `sessions`      | Admin-sesjoner (cookie-basert) |
| `siteContent`   | Nøkkel/verdi-par for redigerbart sideinnhold |
| `contactCards`  | Kontaktkort for kontaktsiden |

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
  -e RESEND_API_KEY=re_... \
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
