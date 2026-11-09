# Implementation status

Last updated: November 9, 2026. Legend: ✅ done and tested · 🟡 done, needs owner action or
credential to activate · ⛔ not built yet.

## P0 — Public website

| Item                                                                                                                                        | Status | Notes                                                                                             |
| ------------------------------------------------------------------------------------------------------------------------------------------- | ------ | ------------------------------------------------------------------------------------------------- |
| Brand system (palette, Inter, coral-in-hands mark, tagline)                                                                                 | ✅     | Mark trimmed for legibility; favicon and app icons regenerated from it                            |
| Home (hero, leaks, services, pilot offer, process, why Koral, industries, honest proof, local, Initiative teaser, "what happens next", FAQ) | ✅     | No testimonials, logos or invented numbers                                                        |
| 7 service pages with problem, outcomes, deliverables, process, fit, boundaries, tools, labeled example, FAQs                                | ✅     | Prices from admin settings ("starting at", with disclaimer, toggleable)                           |
| 4 industry pages (roofing, remodeling/construction, property maintenance, restoration) + index                                              | ✅     | Distinct, trade-specific content                                                                  |
| About (factual founder-led story, vendor-neutral stance)                                                                                    | ✅     | Founder bio editable in settings; no employer/degree/years claims                                 |
| Koral Initiative (planned status, 6 sourced reef facts, commitments, empty verified-contributions log)                                      | ✅     | Status note editable; "active" requires explicit confirmation                                     |
| Contact form → database → internal pipeline                                                                                                 | ✅     | Validation, honeypot, fill-time, rate limits, dedupe, consent capture, UTM attribution            |
| Staff email notification                                                                                                                    | 🟡     | Works once `RESEND_API_KEY`/`EMAIL_FROM` are set; otherwise each lead is flagged "not configured" |
| `/book`                                                                                                                                     | 🟡     | Embeds Calendly only after you verify the link in settings; until then shows the inquiry form     |
| `/insights` + articles                                                                                                                      | 🟡     | 3 original articles loaded as **drafts**; publish from `/app/content` after review                |
| Privacy / Terms                                                                                                                             | 🟡     | Structured drafts with a visible "pending legal review" banner                                    |
| `/demo` synthetic Lead-to-Booked walkthrough                                                                                                | ✅     | Labeled synthetic, `noindex`                                                                      |
| 404 / error pages, responsive layouts, mobile menu, skip link, focus styles                                                                 | ✅     |                                                                                                   |

## P0 — Internal portal (`/app`)

| Item                                                                                                                                                                                                                    | Status |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| Overview with live DB counts, pipeline by stage, latest inquiries, my tasks, setup warnings                                                                                                                             | ✅     |
| Leads: list, stage tabs, search/filter (owner, source), pagination, CSV export (formula-safe), manual lead creation                                                                                                     | ✅     |
| Lead workspace: stage changes (lost reason required), activity log, auto "contacted", details/owner/next action, discovery checklist (12 questions), tasks, consultation records, proposals, convert to client, archive | ✅     |
| Companies & contacts (dedupe by business domain / normalized name / email)                                                                                                                                              | ✅     |
| Proposals: templates, line items, deposit/balance, retainer, statuses, duplicate, printable client document (not an e-signature)                                                                                        | ✅     |
| Clients: profile, portal access (members, roles, invitations), projects from templates, invoices (manual status + hosted payment link), files, tool metadata, updates                                                   | ✅     |
| Projects: milestones, client-checklist tasks, updates, files                                                                                                                                                            | ✅     |
| Support tickets with internal notes                                                                                                                                                                                     | ✅     |
| Tasks (mine / everyone)                                                                                                                                                                                                 | ✅     |
| Content review & publish                                                                                                                                                                                                | ✅     |
| Settings (business details, verification toggles, pricing display, Initiative status, SEO defaults), integration status, team roles & staff invitations                                                                 | ✅     |
| Audit log with entity/tenant filters                                                                                                                                                                                    | ✅     |
| Acquisition metrics (sessions, CTA clicks, form starts→submits, leads by source/stage)                                                                                                                                  | ✅     |

## P0 — Authentication & client portal

| Item                                                                                                                                          | Status  | Notes                                                                                                    |
| --------------------------------------------------------------------------------------------------------------------------------------------- | ------- | -------------------------------------------------------------------------------------------------------- |
| Descope AuthProvider, sign-in flow, server-side session validation                                                                            | 🟡      | Code complete; needs `NEXT_PUBLIC_DESCOPE_PROJECT_ID` (cannot be tested without a real project)          |
| Fail-closed when Descope is missing                                                                                                           | ✅      | Private areas locked; public site unaffected                                                             |
| Database-backed staff roles & client memberships, permission matrix                                                                           | ✅      |                                                                                                          |
| Invitation flow (token links; Descope-emailed when management key set)                                                                        | ✅ / 🟡 | Token flow tested end-to-end; Descope email delivery needs the management key                            |
| First-admin bootstrap (`/setup` + `SETUP_TOKEN`, CLI `admin:grant`)                                                                           | ✅      |                                                                                                          |
| Client portal: overview, projects & milestones, checklist, updates, support, documents, proposals (acknowledgment), invoices, team management | ✅      |                                                                                                          |
| Tenant isolation (404 on cross-org IDs/slugs; client-visibility filters)                                                                      | ✅      | Integration + browser tests                                                                              |
| File storage with expiring signed URLs                                                                                                        | 🟡      | S3-compatible driver implemented and signing verified against the AWS test vector; needs a bucket + keys |
| Dev-only auth mock                                                                                                                            | ✅      | Disabled in production builds and on Vercel                                                              |

## SEO & measurement

| Item                                                                                                               | Status                                                |
| ------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------- |
| Metadata, canonicals, OG/Twitter, sitemap, robots, manifest, llms.txt                                              | ✅                                                    |
| JSON-LD: Organization, ProfessionalService, WebSite, Service, BreadcrumbList, FAQPage (visible FAQs only), Article | ✅                                                    |
| Preview/non-production `noindex`; private routes `X-Robots-Tag: noindex`                                           | ✅                                                    |
| Search Console / Bing verification                                                                                 | 🟡 env var or DNS TXT (see `SEO_LAUNCH_CHECKLIST.md`) |
| First-party cookieless analytics (respects GPC/DNT) + optional Plausible                                           | ✅                                                    |

## Infrastructure

| Item                                                                                                   | Status                                                    |
| ------------------------------------------------------------------------------------------------------ | --------------------------------------------------------- |
| Drizzle schema (26 tables), migrations, RLS-enable migration, production-safe bootstrap, dev-only seed | ✅                                                        |
| Vercel config + `vercel-build` (migrate → bootstrap → build)                                           | ✅ (not deployed — no Vercel credentials in this session) |
| Hostinger DNS instructions preserving email records                                                    | 🟡 owner action                                           |
| Structured redacted logging, audit log, health endpoint, security headers                              | ✅                                                        |

## Test results (November 9, 2026, local PostgreSQL 16)

| Check | Command | Result |
| --- | --- | --- |
| Type check | `npm run typecheck` | ✅ 0 errors |
| Lint | `npm run lint` | ✅ 0 problems |
| Formatting | `npx prettier --check "src/**/*.{ts,tsx,css}"` | ✅ |
| Unit + integration (real Postgres) | `npm test` | ✅ **38 / 38** passed |
| End-to-end (Playwright, Chromium) | `npm run test:e2e` | ✅ **21 / 21** passed (2.7 min) |
| Production build | `npm run build` | ✅ 70+ routes; public pages static/ISR |
| Migrations on a non-superuser owner + RLS denial for other roles | manual psql check | ✅ owner reads rows; API-style role with SELECT grant sees 0 rows |

**Unit / integration coverage:** open-redirect guard; staff/client permission matrix and
non-escalation; CSV formula neutralization; markdown XSS safety; AWS SigV4 official test vector;
upload type/magic-byte/size validation; Central-time date parsing (CST/CDT); PII log redaction;
proposal math; inquiry persistence (lead + contact + company + activity + audit), dedupe of repeat
submissions and same-domain colleagues, field errors, honeypot and too-fast drops, per-IP rate
limit; cross-tenant denial for org resolution, portal reads, ticket threads, internal notes, file
downloads and URL-tampered writes; read-only and member restrictions; owner cannot grant owner;
clients and wrong staff roles blocked from internal actions; lost-reason enforcement; cross-org
project linking refused; credential-like integration notes refused; invitation single use,
verified-email match, staff invitations require verified email, malformed tokens rejected.

**End-to-end coverage:** every sitemap page renders with one H1, title, description and canonical,
no placeholder text; no broken internal links; JSON-LD valid with no rating/review/hours/price
claims; Koral Initiative shows planned status and ≥4 sources; robots/sitemap/llms.txt/manifest
served and private pages `noindex`; private routes redirect to sign-in and file API returns 401;
mobile menu; accessible form validation; **visitor inquiry → DB (UTM, consent, service interest,
"notification not configured") → sales works the lead (call, auto-contacted, qualified, discovery,
task, meeting; survives refresh) → proposal with added line item, totals, sent, printable →
converted to client → project from template, milestone, client-visible update → invitation link →
invited user accepts, sees only their workspace, acknowledges the proposal, opens a support request
→ cross-tenant URL returns 404 and `/app` is refused → staff replies → audit log shows each step**;
Org A owner gets 404 for Org B slug, ticket and project IDs; internal notes, hidden milestones and
draft invoices invisible; read-only users cannot open requests or manage the team; sales is denied
Settings.

**Not testable in this session (no credentials):** real Descope sign-in/sign-out and session
refresh, Descope-sent invitation emails, Resend delivery, S3 upload/download against a real
bucket, Vercel deployment, DNS. Each fails safe and reports "not configured".

**Engineering note:** Next 16's Turbopack dev cache occasionally entered a recompile/reload storm
during e2e runs; `scripts/e2e.mjs` therefore runs each suite against a fresh, isolated build
directory (`.next-e2e`) and keeps all logs/artifacts outside the project tree.

## Remaining work / backlog (honest)

1. **Owner credentials** — Postgres, Descope (project + flow + management key), Resend, storage,
   Vercel, DNS. See `DEPLOYMENT.md`.
2. **Content-Security-Policy** (nonce-based) — not yet added.
3. **Malware scanning** for uploads — not implemented (type/signature/size limits only).
4. **Online payments** — no Stripe integration; invoices use hosted payment links and manual recording.
5. **Legal review** of privacy/terms; publish vendor list.
6. **Article review** — publish the three drafts after fact-checking.
7. **AI-assisted drafting** — intentionally not built (no provider key; human-reviewed mode would be added behind an explicit flag).
8. **Vendor integrations** (JobNimbus, Jobber, etc.) — only metadata tracking; real connectors are per-client implementation work.
9. Nice-to-have: email-based ticket notifications to clients, Descope tenant sync, CSP, Lighthouse CI.
