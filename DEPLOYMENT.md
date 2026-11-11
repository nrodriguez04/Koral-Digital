# Deployment guide

Target: **Cloudflare Workers** (Next.js through the
[OpenNext Cloudflare adapter](https://opennext.js.org/cloudflare)) with **managed PostgreSQL**
(Supabase recommended; Neon works too), and the domain's DNS on **Cloudflare**.

Cloudflare builds and deploys from GitHub (**Workers Builds**): every push to `master` deploys
production. The site is safe to deploy before the optional integrations are configured — each one
reports "not configured" instead of failing silently.

---

## 0. Environment variables

There are three places a value can live:

- **`.env.production`** (committed) — public, non-secret values. `NEXT_PUBLIC_*` values are
  inlined into the browser bundle at build time, and the Worker reads this file at runtime too.
- **Build variables** — Worker → Settings → Build → _Variables and secrets_. Visible only to
  the build and deploy commands (migrations, prerendering).
- **Runtime secrets** — Worker → Settings → _Variables and Secrets_. Add each as type **Secret**.
  `wrangler.jsonc` sets `keep_vars`, so a deploy never wipes them.

| Variable                                                                                                                     | Set in                                | Where it comes from                                   | Notes                                                              |
| ---------------------------------------------------------------------------------------------------------------------------- | ------------------------------------- | ----------------------------------------------------- | ------------------------------------------------------------------ |
| `NEXT_PUBLIC_SITE_URL`                                                                                                       | `.env.production`                     | `https://koraldigital.com`                            | Canonical URLs, sitemap, invitation links                          |
| `NEXT_PUBLIC_DESCOPE_PROJECT_ID`                                                                                             | `.env.production`                     | Descope console → Project settings                    | Public by design (it ships to the browser)                         |
| `NEXT_PUBLIC_DESCOPE_SIGN_IN_FLOW_ID`                                                                                        | `.env.production`                     | Descope flow ID                                       | `koral-digital-sign-in` — a sign-in-only flow, see step 2          |
| `NEXT_PUBLIC_DESCOPE_BASE_URL`                                                                                               | `.env.production`                     | Descope custom domain                                 | Optional; leave unset by default                                   |
| `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION`, `NEXT_PUBLIC_BING_SITE_VERIFICATION`                                                 | `.env.production`                     | Search Console / Bing Webmaster Tools                 | Optional; or verify via DNS instead                                |
| `NEXT_PUBLIC_PLAUSIBLE_DOMAIN`                                                                                               | `.env.production`                     | `koraldigital.com`                                    | Optional cookieless analytics                                      |
| `DATABASE_URL`                                                                                                               | Runtime secret **and** build variable | Postgres provider (pooled URL)                        | Supabase: _Transaction pooler_, port 6543                          |
| `DATABASE_URL_UNPOOLED`                                                                                                      | Build variable                        | Postgres provider (direct URL)                        | Used only by migrations                                            |
| `APP_SECRET`                                                                                                                 | Runtime secret                        | `openssl rand -base64 48`                             | Signs rate-limit fingerprints; 32+ chars                           |
| `DESCOPE_MANAGEMENT_KEY`                                                                                                     | Runtime secret                        | Descope → Company → Management keys                   | Needed with the sign-in-only flow, see step 2                      |
| `SETUP_TOKEN`                                                                                                                | Runtime secret (first deploy only)    | `openssl rand -base64 32`                             | Lets you claim the first superadmin at `/setup`; delete afterwards |
| `RESEND_API_KEY`                                                                                                             | Runtime secret                        | resend.com → API keys                                 | Staff notifications for new inquiries/tickets                      |
| `EMAIL_FROM`, `LEAD_NOTIFICATION_EMAILS`                                                                                     | Runtime secret                        | e.g. `Koral Digital <notifications@koraldigital.com>` | Domain must be verified in Resend                                  |
| `STORAGE_DRIVER`, `S3_ENDPOINT`, `S3_REGION`, `S3_BUCKET`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`, `S3_FORCE_PATH_STYLE` | Runtime secret                        | Cloudflare R2 / Supabase Storage / AWS                | `s3` or `none`; `local` is development-only                        |
| `SITE_INDEXING`                                                                                                              | Runtime secret                        | `auto`                                                | `auto` = production builds are indexable                           |
| `AUTH_DEV_MOCK`                                                                                                              | Never in prod                         | —                                                     | Ignored in production builds                                       |

**Never deploy from your own machine** (`npm run cf:deploy` locally). The build bundles every
`.env*` file it finds, including your `.env.local`. Let Workers Builds deploy from GitHub.

## 1. PostgreSQL (≈10 minutes)

**Supabase (recommended):**

1. Create a project named `koral-digital`, region **US East (N. Virginia)**, close to most of
   the traffic. Choose a strong database password and keep it in a password manager.
2. Project → **Connect** → copy the **Transaction pooler** URI (port 6543) → `DATABASE_URL`, and
   the **Direct connection** / session URI (port 5432) → `DATABASE_URL_UNPOOLED`.
3. Recommended: Project Settings → **Data API** → disable it (this app does not use it).
   Migration `0001_enable_rls` also enables row-level security on every table and revokes
   `anon`/`authenticated` access, so the public anon key cannot read data even if the API is on.
4. Backups: daily backups require a paid plan; enable Point-in-Time Recovery when you have
   paying clients. Until then, schedule a weekly `pg_dump` to secure storage.

On Workers, each request opens its own connection (a socket cannot outlive the request that
opened it), so always use the pooler URL at runtime. If database pages feel slow, put
[Hyperdrive](https://developers.cloudflare.com/hyperdrive/) in front of Postgres later.

Migrations and the content bootstrap run in the **deploy** step (`npm run cf:deploy`), which
Workers Builds runs only for the production branch, so preview branches never touch the
database schema. To run them manually from your machine:

```bash
DATABASE_URL="postgres://…direct…" npm run db:migrate
```

```bash
DATABASE_URL="postgres://…direct…" npm run db:bootstrap
```

Never run `db:seed:dev` against production — it refuses non-local databases.

## 2. Descope (≈15 minutes)

The project ID and the flow ID (`koral-digital-sign-in`) are already in `.env.production`.

1. **Authentication methods:** the flow offers email, passkeys, Google, Microsoft and Apple.
   Each social provider must be enabled under Authentication Methods for its button to work.
2. **The flow is sign-in only** ("Don't have an account? Contact your administrator"). Nobody
   can create their own account. So that invitations work:
   - **Recommended:** create a Management Key (Company settings → Management Keys) and set
     `DESCOPE_MANAGEMENT_KEY`. Invitations you send from the portals then create the user in
     Descope, and Descope emails them a sign-in link.
   - **Without a management key:** create every invited user yourself in the Descope console
     → Users before they try to sign in.
3. **Project → Approved domains:** add `koraldigital.com`, `www.koraldigital.com` and `localhost`.
4. **Session:** keep the default (the SDK stores the session token in the `DS` cookie, which the
   server validates on every request). Session timeout of 1–7 days is reasonable.
5. Optional: JWT template adding `email` and `email_verified` claims (lets invitations match
   verified emails without the management key).

**First administrator:**

1. Create your own user in the Descope console → Users.
2. Set the `SETUP_TOKEN` secret and let the Worker redeploy.
3. Visit `https://koraldigital.com/sign-in` and sign in with your own email.
4. You will land on "nothing to show yet". Go to `/setup`, paste the setup token → you become
   **superadmin**. This only works while no staff account exists.
5. Delete the `SETUP_TOKEN` secret.

Alternative from a terminal with database access: sign in once, then
`npm run admin:grant -- --email you@koraldigital.com --role superadmin`.

## 3. Email notifications — Resend (≈15 minutes + DNS propagation)

1. Create a Resend account → **Domains** → add `koraldigital.com` (Resend uses a `send.`
   subdomain for bounce handling, so your existing inbox MX records are not touched).
2. Add the DKIM/SPF/MX records Resend shows in **Cloudflare → DNS**, with the proxy **off**
   (grey cloud, "DNS only") on every one of them. Wait for "Verified".
3. Create an API key with _Sending access_ → `RESEND_API_KEY`.
4. `EMAIL_FROM="Koral Digital <notifications@koraldigital.com>"`,
   `LEAD_NOTIFICATION_EMAILS=contact@koraldigital.com` (or set recipients in `/app/settings`).
5. Before relying on it, confirm `contact@koraldigital.com` actually receives mail (send it a
   test from a personal account). Then tick "mailbox verified" in `/app/settings` to show the
   address publicly.

Until this is configured, every new lead shows "No email notification was sent" in the portal
and the overview lists it under setup items — check `/app/leads` daily.

## 4. Client document storage (≈10 minutes, optional)

**Cloudflare R2** (same account as the Worker):

1. R2 → **Create bucket** `koral-client-files`. Leave public access off.
2. R2 → **Manage API tokens** → create a token with _Object Read & Write_ on that bucket.
3. Set `STORAGE_DRIVER=s3`, `S3_ENDPOINT=https://<account-id>.r2.cloudflarestorage.com`,
   `S3_REGION=auto`, `S3_BUCKET=koral-client-files`, `S3_ACCESS_KEY_ID`,
   `S3_SECRET_ACCESS_KEY`, `S3_FORCE_PATH_STYLE=true`.

**Supabase Storage** works the same way: a private `client-files` bucket, Storage → Settings →
**S3 Connection**, `S3_ENDPOINT=https://<project-ref>.supabase.co/storage/v1/s3`.

Uploads are limited to 4 MB and PDF, PNG, JPG, WebP, TXT, CSV, DOCX, XLSX, PPTX (checked by
extension and file signature). There is no antivirus scanning yet — see `SECURITY.md`.

## 5. Cloudflare Workers (≈10 minutes)

1. **Create the page-cache bucket.** R2 → **Create bucket** → `koral-digital-cache` (the name
   in `wrangler.jsonc`). Deploys fail until it exists. R2 has a free tier but must be enabled
   on the account once.
2. Workers & Pages → `koral-digital` → **Settings → Build**:
   - Git repository: `nrodriguez04/Koral-Digital`, production branch `master`.
   - **Build command:** `npm run cf:build`
   - **Deploy command:** `npm run cf:deploy` (migrate → bootstrap → deploy)
   - **Preview command** (non-production branches): `npx opennextjs-cloudflare upload`, or turn
     non-production builds off.
3. Add the **build variables** and **runtime secrets** from step 0.
4. Push to `master` (or Retry the latest build). Check
   `https://koral-digital.<your-subdomain>.workers.dev/api/health` →
   `{"status":"ok","database":"ok",…}`.

To try the production build locally in the Workers runtime: `npm run preview`
(http://localhost:8787). It needs Node 20.19+ (22+ recommended), and a `.dev.vars` file
containing `NEXTJS_ENV=development`.

## 6. Domain on Cloudflare

The nameservers moved from Hostinger to Cloudflare, which imported the old DNS records.

1. **Keep the email records:** `MX`, `TXT` (SPF, DKIM, DMARC, verification) and any mail
   `CNAME`s. Check that their proxy status is **DNS only**.
2. **Delete the old web records:** the `A`/`AAAA` records for `koraldigital.com` and the `www`
   record that point at Hostinger's servers. While these are proxied, Cloudflare tries to reach
   Hostinger and fails with **HTTP 525** (SSL handshake failed).
3. Worker → **Settings → Domains & Routes → Add → Custom domain**: add `koraldigital.com`, then
   `www.koraldigital.com`. Cloudflare creates the DNS records and certificates itself.
4. **Rules → Redirect Rules →** template "Redirect from WWW to root" (301), so
   `www.koraldigital.com` lands on `koraldigital.com`.
5. **SSL/TLS → Edge Certificates →** turn on _Always Use HTTPS_.
6. **Let AI crawlers in:** Security → Bots → turn off _Block AI bots_. In AI Crawl Control,
   allow the crawlers `robots.txt` allows. Leave _Bot Fight Mode_ off; it challenges search and
   AI crawlers.
7. Verify: `https://koraldigital.com` loads, `http://` and `www.` redirect to it, and your email
   still sends and receives.

## 7. Booking link

The historical Calendly URL (`https://calendly.com/contact-koraldigital`) is pre-filled but
**not displayed** until verified. Open it in a private window, book a test meeting, confirm the
notification arrives, then tick "I tested this link" in `/app/settings`. `/book` then embeds it;
until then it shows the inquiry form.

## 8. Go-live verification (≈15 minutes)

1. Submit the form at `/contact` from a phone using a personal email.
2. Confirm: the lead appears in `/app/leads`, the notification email arrives (or the lead shows
   "notification not configured"), and the confirmation message displayed.
3. Create a test client from that lead, invite a second personal email as `client_owner`, accept
   the invitation, and confirm the portal shows only that workspace. Then archive the test lead.
4. Log out and confirm `/app` and `/portal/<slug>` redirect to sign-in.
5. `https://koraldigital.com/robots.txt` allows crawling; `/sitemap.xml` lists the public pages.
6. Run Google's Rich Results Test on `/` and `/services/lead-to-booked` (see `SEO_LAUNCH_CHECKLIST.md`).

## Operations

- **Logs:** Worker → Observability (enabled in `wrangler.jsonc`). Application logs are
  structured JSON with PII keys redacted.
- **Health:** `/api/health` (no secrets; suitable for an uptime monitor).
- **Rollbacks:** Worker → Deployments → roll back to a previous version. Migrations are additive.
- **Rotating secrets:** update the secret in the dashboard; it takes effect on the next request.
  Rotating `APP_SECRET` only resets rate-limit fingerprints.
- **Content freshness:** public pages are cached in R2 and regenerate every 5 minutes, so an
  edited setting or a newly published article goes live within 5 minutes.

## Known limits of the Cloudflare build

- **`postgres` is pinned to 3.4.9.** With postgres 4.x the adapter cannot bundle the server
  ([opennextjs-cloudflare#1485](https://github.com/opennextjs/opennextjs-cloudflare/issues/1485)).
  Upgrade when that issue is fixed.
- **`src/middleware.ts`, not `proxy.ts`.** Next 16 prints a deprecation notice. A Node-runtime
  `proxy.ts` is experimental on Workers and adds about 4 MB to the Worker
  ([#1373](https://github.com/opennextjs/opennextjs-cloudflare/issues/1373)).
- **No tag cache**, so `revalidatePath()` does not purge cached public pages; the 5-minute
  regeneration does. Add a D1 or Durable Object tag cache if changes must appear instantly.
- **Worker size** is about 2.4 MB gzipped: inside the Free plan's 3 MB limit, with little room.
  The Workers Paid plan allows 10 MB and more CPU time per request.
