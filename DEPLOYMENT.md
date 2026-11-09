# Deployment guide

Target: **Vercel** (Next.js) + **managed PostgreSQL** (Supabase recommended; Neon works too),
with the domain staying registered at **Hostinger** and only DNS records pointed at Vercel.

Nothing in this guide has been executed against your accounts yet. Each step lists what you
need to do and how to verify it. Do the steps in order; the site is safe to deploy before the
optional integrations are configured — each one reports "not configured" instead of failing silently.

---

## 0. Environment variables

| Variable                                                                                                   | Required          | Where it comes from                                   | Notes                                                              |
| ---------------------------------------------------------------------------------------------------------- | ----------------- | ----------------------------------------------------- | ------------------------------------------------------------------ |
| `NEXT_PUBLIC_SITE_URL`                                                                                     | Yes               | `https://koraldigital.com`                            | Canonical URLs, sitemap, invitation links                          |
| `DATABASE_URL`                                                                                             | Yes               | Postgres provider (pooled URL)                        | Supabase: _Transaction pooler_, port 6543                          |
| `DATABASE_URL_UNPOOLED`                                                                                    | Recommended       | Postgres provider (direct URL)                        | Used only by migrations                                            |
| `APP_SECRET`                                                                                               | Yes               | `openssl rand -base64 48`                             | Signs rate-limit fingerprints; 32+ chars                           |
| `NEXT_PUBLIC_DESCOPE_PROJECT_ID`                                                                           | Yes (for logins)  | Descope console → Project settings                    | Without it, `/app` and `/portal` stay locked                       |
| `NEXT_PUBLIC_DESCOPE_SIGN_IN_FLOW_ID`                                                                      | Yes               | Descope flow ID                                       | `sign-in` (with management key) or `sign-up-or-in` (without)       |
| `DESCOPE_MANAGEMENT_KEY`                                                                                   | Recommended       | Descope → Company → Management keys                   | Enables Descope-sent invite emails + verified-email matching       |
| `NEXT_PUBLIC_DESCOPE_BASE_URL`                                                                             | Optional          | Descope custom domain                                 | Leave empty by default                                             |
| `SETUP_TOKEN`                                                                                              | First deploy only | `openssl rand -base64 32`                             | Lets you claim the first superadmin at `/setup`; remove afterwards |
| `RESEND_API_KEY`                                                                                           | Recommended       | resend.com → API keys                                 | Staff notifications for new inquiries/tickets                      |
| `EMAIL_FROM`                                                                                               | With Resend       | e.g. `Koral Digital <notifications@koraldigital.com>` | Domain must be verified in Resend                                  |
| `LEAD_NOTIFICATION_EMAILS`                                                                                 | Optional          | Comma-separated                                       | Overrides the admin setting                                        |
| `STORAGE_DRIVER`                                                                                           | Optional          | `s3` or `none`                                        | `local` is development-only                                        |
| `S3_ENDPOINT`, `S3_REGION`, `S3_BUCKET`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`, `S3_FORCE_PATH_STYLE` | With `s3`         | Supabase Storage S3 / R2 / AWS                        | Private bucket; downloads use 5-minute signed URLs                 |
| `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION`                                                                     | Optional          | Search Console HTML-tag value                         | Or verify via DNS instead                                          |
| `NEXT_PUBLIC_BING_SITE_VERIFICATION`                                                                       | Optional          | Bing Webmaster Tools                                  |                                                                    |
| `NEXT_PUBLIC_PLAUSIBLE_DOMAIN`                                                                             | Optional          | `koraldigital.com`                                    | Cookieless analytics; first-party events work without it           |
| `SITE_INDEXING`                                                                                            | Optional          | `auto`                                                | `auto` = index only on Vercel Production; previews are `noindex`   |
| `AUTH_DEV_MOCK`                                                                                            | Never in prod     | —                                                     | Ignored on Vercel and in production builds                         |

Set secrets in **Vercel → Project → Settings → Environment Variables** with the _Production_
scope. Give _Preview_ deployments a separate database (or none) so previews never touch
production data.

## 1. PostgreSQL (≈10 minutes)

**Supabase (recommended):**

1. Create a project named `koral-digital`, region **US East (N. Virginia)** to sit next to
   Vercel's `iad1` region (set in `vercel.json`). Choose a strong database password and keep it
   in a password manager.
2. Project → **Connect** → copy the **Transaction pooler** URI (port 6543) → `DATABASE_URL`, and
   the **Direct connection** / session URI (port 5432) → `DATABASE_URL_UNPOOLED`.
3. Recommended: Project Settings → **Data API** → disable it (this app does not use it).
   Migration `0001_enable_rls` also enables row-level security on every table and revokes
   `anon`/`authenticated` access, so the public anon key cannot read data even if the API is on.
4. Backups: daily backups require a paid plan; enable Point-in-Time Recovery when you have
   paying clients. Until then, schedule a weekly `pg_dump` to secure storage.

Migrations and the content bootstrap run automatically during each Vercel build
(`npm run vercel-build`). To run them manually from your machine:

```bash
DATABASE_URL="postgres://…direct…" npm run db:migrate
```

```bash
DATABASE_URL="postgres://…direct…" npm run db:bootstrap
```

Never run `db:seed:dev` against production — it refuses non-local databases.

## 2. Descope (≈15 minutes)

1. Create a Descope project (Production). Copy the **Project ID**.
2. **Authentication methods:** enable Email OTP or Magic Link (simple, passwordless). Optionally
   add passkeys or Google.
3. **Flows:** choose one of:
   - **Recommended:** create a Management Key (Company settings → Management Keys) and set
     `DESCOPE_MANAGEMENT_KEY`. Use the built-in **`sign-in`** flow (no self sign-up). Invitations
     you send from the portals create the user in Descope and Descope emails them a sign-in link.
   - **Without a management key:** use **`sign-up-or-in`**. Anyone can create a Descope identity,
     but they get **no access** in this app until they accept an invitation link you send them.
     Staff invitations additionally require a verified email (add an `email` claim via a JWT
     template, or grant staff roles with the CLI).
4. **Project → Approved domains:** add `koraldigital.com`, `www.koraldigital.com` and `localhost`.
5. **Session:** keep the default (the SDK stores the session token in the `DS` cookie, which the
   server validates on every request). Session timeout of 1–7 days is reasonable.
6. Optional: JWT template adding `email` and `email_verified` claims (lets invitations match
   verified emails without the management key).

**First administrator:**

1. Set `SETUP_TOKEN` in Vercel and deploy.
2. Visit `https://koraldigital.com/sign-in` and sign in with your own email (with the
   `sign-in`-only flow, first create your user in the Descope console → Users).
3. You will land on "nothing to show yet". Go to `/setup`, paste the setup token → you become
   **superadmin**. This only works while no staff account exists.
4. Remove `SETUP_TOKEN` from Vercel and redeploy.

Alternative from a terminal with database access: sign in once, then
`npm run admin:grant -- --email you@koraldigital.com --role superadmin`.

## 3. Email notifications — Resend (≈15 minutes + DNS propagation)

1. Create a Resend account → **Domains** → add `koraldigital.com` (Resend uses a `send.`
   subdomain for bounce handling, so your existing inbox MX records are not touched).
2. Add the DKIM/SPF/MX records Resend shows to **Hostinger DNS** (step 6). Wait for "Verified".
3. Create an API key with _Sending access_ → `RESEND_API_KEY`.
4. `EMAIL_FROM="Koral Digital <notifications@koraldigital.com>"`,
   `LEAD_NOTIFICATION_EMAILS=contact@koraldigital.com` (or set recipients in `/app/settings`).
5. Before relying on it, confirm `contact@koraldigital.com` actually receives mail (send it a
   test from a personal account). Then tick "mailbox verified" in `/app/settings` to show the
   address publicly.

Until this is configured, every new lead shows "No email notification was sent" in the portal
and the overview lists it under setup items — check `/app/leads` daily.

## 4. Client document storage — Supabase Storage (≈10 minutes, optional)

1. Supabase → Storage → **New bucket** `client-files`, **Private** (not public).
2. Storage → Settings → **S3 Connection** → enable, create an access key.
3. Set `STORAGE_DRIVER=s3`, `S3_ENDPOINT=https://<project-ref>.supabase.co/storage/v1/s3`,
   `S3_REGION=<project region, e.g. us-east-1>`, `S3_BUCKET=client-files`,
   `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`, `S3_FORCE_PATH_STYLE=true`.

Uploads are limited to 4 MB and PDF, PNG, JPG, WebP, TXT, CSV, DOCX, XLSX, PPTX (checked by
extension and file signature). There is no antivirus scanning yet — see `SECURITY.md`.

## 5. Vercel (≈10 minutes)

1. Vercel → **Add New Project** → import GitHub repo `nrodriguez04/koral-digital`.
   Framework: Next.js (auto). Leave build/output settings at defaults — Vercel runs the
   `vercel-build` script (migrate → bootstrap → build).
2. Production branch: `master` (merge the `launch/koral-v1` branch first) or select the branch.
3. Add the environment variables from step 0.
4. Deploy. Check `https://<project>.vercel.app/api/health` → `{"status":"ok","database":"ok",…}`.

## 6. Domain — keep Hostinger as registrar, point DNS at Vercel

**Do not transfer the domain or change nameservers.** Only add/replace the web records.

1. **First, record what exists.** Hostinger hPanel → Domains → `koraldigital.com` → **DNS / Nameservers**.
   Screenshot or export every record. Pay special attention to **MX**, **TXT (SPF, DKIM,
   DMARC, verification)** and **CNAME** records used by your mailbox — these must stay.
2. Vercel → Project → **Settings → Domains** → add `koraldigital.com` and `www.koraldigital.com`.
   Set `www.koraldigital.com` to **redirect (308) to `koraldigital.com`**.
3. Vercel shows the exact records to create. Typically:
   - `A` record, host `@` → `76.76.21.21` (use the value Vercel displays)
   - `CNAME` record, host `www` → `cname.vercel-dns.com` (use the value Vercel displays)
4. In Hostinger DNS, delete **only** the conflicting web records: existing `A`/`AAAA` records for
   `@` and the existing `www` record (often Hostinger parking/website records). Leave MX/TXT alone.
   If a `CAA` record exists, make sure it allows `letsencrypt.org`.
5. Wait for Vercel to show the domain as **Valid** and the SSL certificate as issued (minutes
   to a few hours).
6. Verify: `https://koraldigital.com` loads, `http://` and `www.` redirect to it, and your email
   still sends/receives.

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

- **Logs:** Vercel → Logs. Application logs are structured JSON with PII keys redacted.
- **Health:** `/api/health` (no secrets; suitable for an uptime monitor).
- **Rollbacks:** Vercel → Deployments → Promote a previous deployment. Migrations are additive.
- **Rotating secrets:** update in Vercel and redeploy. Rotating `APP_SECRET` only resets
  rate-limit fingerprints.
