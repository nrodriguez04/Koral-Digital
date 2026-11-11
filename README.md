# Koral Digital

Marketing website, internal operations portal and multi-tenant client portal for
**Koral Digital** — a founder-led digital operations, automation and
systems-integration consultancy for home-service businesses worldwide.

> _Building a better tomorrow._

| Area                          | Path                                                                                                                                | Who                                                             |
| ----------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------- |
| Public website (SSR/SSG, SEO) | `/`, `/services/*`, `/industries/*`, `/about`, `/koral-initiative`, `/contact`, `/book`, `/insights`, `/demo`, `/privacy`, `/terms` | Everyone                                                        |
| Internal portal ("Koral Ops") | `/app/*`                                                                                                                            | Koral staff (superadmin / admin / sales / delivery)             |
| Client portal                 | `/portal/[org]/*`                                                                                                                   | Invited client users (client_owner / client_member / read_only) |

See [`IMPLEMENTATION_STATUS.md`](IMPLEMENTATION_STATUS.md) for what is done and what is
blocked, [`DEPLOYMENT.md`](DEPLOYMENT.md) to go live, [`SECURITY.md`](SECURITY.md) for the
security model and [`SEO_LAUNCH_CHECKLIST.md`](SEO_LAUNCH_CHECKLIST.md) for search setup.

## Stack

- **Next.js 16** (App Router, Turbopack, Edge `middleware.ts`), **React 19**, **TypeScript** (strict)
- **Tailwind CSS v4**, Lucide icons, self-hosted Inter (no external font requests)
- **PostgreSQL** + **Drizzle ORM** (SQL migrations in `drizzle/`), Zod validation
- **Descope** (`@descope/nextjs-sdk`) for authentication; authorization is database-backed
- Optional: **Resend** (email), **S3-compatible storage** (Supabase Storage / R2 / S3), Plausible
- Tests: **Vitest** (unit + integration against real Postgres) and **Playwright** (end-to-end)
- Deploy target: **Cloudflare Workers** via the OpenNext adapter + managed Postgres (Supabase or Neon)

## Quick start (local)

Requirements: Node 20.9+ (22 recommended) and a PostgreSQL 14+ database.

```bash
npm install
```

```bash
cp .env.example .env.local
```

Edit `.env.local`: set `DATABASE_URL`, an `APP_SECRET` (`openssl rand -base64 48`), and for
local development `AUTH_DEV_MOCK=true` and `STORAGE_DRIVER=local`.

```bash
npm run db:migrate
```

```bash
npm run db:bootstrap
```

```bash
npm run db:seed:dev
```

```bash
npm run dev
```

Open http://localhost:3000. With `AUTH_DEV_MOCK=true`, `/dev-login` lists **synthetic**
development accounts (staff in every role, owners of two isolated demo client orgs, and a
user with no access). The mock is hard-disabled in production builds.

## Scripts

| Command                                                      | What it does                                                                         |
| ------------------------------------------------------------ | ------------------------------------------------------------------------------------ |
| `npm run dev` / `build` / `start`                            | Next.js dev server / production build / production server                            |
| `npm run lint` / `typecheck` / `format`                      | ESLint, `tsc --noEmit`, Prettier                                                     |
| `npm run db:generate`                                        | Generate a SQL migration after editing `src/db/schema.ts`                            |
| `npm run db:migrate`                                         | Apply migrations (skips with a warning if `DATABASE_URL` is unset)                   |
| `npm run db:bootstrap`                                       | **Production-safe**, idempotent: default site settings + editorial article drafts    |
| `npm run db:seed:dev`                                        | **Development only** synthetic data (refuses non-local databases)                    |
| `npm run admin:grant -- --email you@x.com --role superadmin` | Grant a staff role from a terminal                                                   |
| `npm test`                                                   | Unit + integration tests (needs Postgres; uses `TEST_DATABASE_URL` or `koral_test`)  |
| `npm run test:e2e`                                           | Playwright end-to-end tests (needs Postgres; uses `E2E_DATABASE_URL` or `koral_e2e`) |
| `npm run preview`                                            | Build for Cloudflare and run it locally in the Workers runtime (port 8787)           |
| `npm run cf:build` / `cf:deploy`                             | What Cloudflare Workers Builds runs: build, then migrate → bootstrap → deploy        |

## How it fits together

```
src/
  app/
    (marketing)/        public pages (server-rendered, ISR for settings-driven content)
    app/                internal portal — every page calls pageRequireStaff(permission)
    portal/[org]/       client portal — every page calls pageRequireOrgMember(slug)
    api/                events (first-party analytics), files/[id] (authorized downloads), health
    sign-in, invite/[token], setup, no-access, dev-login (dev only), auth/continue
    sitemap.ts, robots.ts, manifest.ts, llms.txt
  content/              versioned marketing copy (services, industries, initiative, articles, legal, FAQs)
  db/schema.ts          26 tables, enums, indexes, constraints
  lib/auth/             Descope session validation, actor resolution, guards, permissions, invitations
  lib/                  env, settings, rate limiting, email, storage (SigV4), SEO/JSON-LD, markdown, audit
  server/               data access (leads, proposals, clients, projects, tickets, portal, files)
  middleware.ts         fast pre-check + noindex headers for /app and /portal (not the security boundary)
scripts/                migrate, bootstrap (prod-safe), seed-dev (dev-only), grant-role
tests/                  unit, integration (Postgres), e2e (Playwright)
```

**Lead flow:** `/contact` → server action → Zod validation, honeypot, fill-time check,
Postgres-backed rate limits → company/contact/lead dedupe in a transaction → activity +
audit event → staff email (if Resend is configured; otherwise the lead is flagged
"notification not configured") → appears instantly in `/app/leads`.

**Sales → delivery:** lead stages (new → contacted → qualified → discovery → proposal →
won/lost) · discovery checklist · consultation records · tasks · proposals with line items,
deposit/balance and a printable client document · convert to client workspace · projects from
templates (milestones + client checklist) · invoices (manual status + hosted payment links) ·
files · tool metadata · client updates · support tickets.

**Authorization:** Descope proves identity; the local database decides access. Staff roles
live on `users.staff_role` and are granted only by an admin, the one-time `/setup` token, or
the CLI — never by email domain or user-editable metadata. Client access is a `memberships`
row created only by accepting an invitation. Every customer-owned table carries `org_id`, and
portal queries resolve the org **only** from the caller's own memberships.

## Content editing

- **Admin-editable without deploys** (`/app/settings`): business name, tagline, contact email
  (shown publicly only once marked verified), phone, headquarters city, booking URL (embedded only
  once verified), notification recipients, founder bio, "starting at" prices and whether to show
  them, Koral Initiative status note, SEO defaults.
- **Insights articles** (`/app/content`): three original drafts are loaded by `db:bootstrap` as
  **drafts**. Review, tick the accuracy confirmation, and publish — they then appear on
  `/insights` and in the sitemap.
- **Long-form marketing copy** lives in `src/content/*.ts` and is reviewed like code.

## Known limitations

See the "Remaining work" section of [`IMPLEMENTATION_STATUS.md`](IMPLEMENTATION_STATUS.md).
Highlights: Descope, Resend, storage and Postgres credentials must be supplied by the owner;
no online card payments (hosted payment links + manual recording instead); no malware scanning
of uploads (type/magic-byte/size restrictions only); privacy/terms are drafts pending legal review.
