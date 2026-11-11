# CLAUDE CODE: BUILD AND LAUNCH KORAL DIGITAL

You are the principal engineer, product designer, technical SEO lead, and pragmatic launch owner for **Koral Digital**. Build a real, coherent full-stack web application, not a pitch deck, Figma mockup, throwaway scaffold, or collection of dead-end buttons. **Start coding now**, use the current working directory/repository, run tests, and leave a clear deploy handoff. Today is November 9, 2026. Prioritize what can actually be put in front of prospective paying customers today. Do not spend the whole session writing a plan. Do not invent production credentials, integrations, customers, reviews, revenue claims, charitable contributions, legal entity status, or successful deployments.

## 0. READ THIS FIRST — BUSINESS AND BRAND

**Business:** Koral Digital | https://koraldigital.com | based in Frisco, Texas, serving North Dallas–Fort Worth and remotely as suitable. Prior public contact address: contact@koraldigital.com (verify before using it as a receiving mailbox). Historical booking URL: https://calendly.com/contact-koraldigital (verify before linking; make configurable). Founder previously identified as Nicolas Rodriguez, a technically hands-on software/customer-success professional. If publishing an individual's biography, make it factual, concise, and editable; do not mention his current employer or infer degrees, credentials, client logos, or years of experience. Primary tagline from existing branding: **"Building a better tomorrow."**

**Company direction:** Koral started with lead generation and digital marketing for roofing, solar, and home-service businesses (Google PPC, websites/funnels, marketing strategy, analytics). The refined business is a **vendor-neutral implementation and operations partner** for home-service companies—especially roofing, construction, remodeling, property maintenance, restoration, and similar contractors. Koral helps businesses turn more inquiries into scheduled estimates and ultimately jobs, by making their *existing tools* work together. Services include:
1. Lead response, missed-lead and missed-call recovery, intake and scheduling handoffs.
2. CRM rescue, configuration, cleanup, migration where appropriate, and integrations.
3. Unsold-estimate follow-up/reactivation and sales pipeline automation.
4. Back-office operations, AI-assisted classification/drafting, notifications, human escalation, and tailored workflows.
5. Lead-source-to-appointment-to-contract reporting and revenue attribution.
6. Managed automation monitoring, maintenance, optimization and support retainers.
7. Existing marketing heritage: conversion-focused websites, lead-generation funnels, Google Ads/PPC and sales-enablement consulting, offered as appropriate (do not overpromise full-service agency scale).

**Market promise:** "Stop losing leads in the gaps between your ads, phones, CRM, calendar and sales team." Alternate hero: "Turn more leads into booked jobs, without replacing the tools you already use." Prefer measurable operational outcomes and human accountability over generic "AI agency" hype.

**Initial productized offer:** **Lead-to-Booked**, a 14-day fixed-scope pilot focused on one or two incoming lead sources, contact capture/deduplication, notification/routing, human-approved response drafts, scheduling handoff and operational reporting. Founding pilot *starting at* $2,500 and optional support *starting at* $500/month, clearly indicative/subject to scope. Prices must be configuration-driven; do not publish hard commitments if not approved. Other offerings: CRM Rescue, Unsold Estimate Recovery, RevOps & Attribution, Managed Automation. A discovery/diagnostic → fixed-fee implementation → ongoing optimization service model. The website should primarily sell a free initial consultation/workflow review, not a self-serve SaaS license.

**Koral Initiative:** Meaningful brand mission tied to coral reefs/ocean stewardship. It is an **aspirational future giving program** under which Koral Digital plans to support carefully vetted coral-reef conservation and restoration organizations as the business grows. Show why reefs matter, transparent intent, and a commitment to publish recipients and verified contributions when a giving program actually begins. **DO NOT** claim donations are happening today, assert that 10% of revenue/profits is currently donated, claim affiliation with a specific charity, display partner logos, or fabricate impact totals. This is a mission and future initiative, not a currently funded program. "Building a better tomorrow" bridges business operations and stewardship. Koral can optionally update impact content later through the admin portal.

**Brand:** User's current screenshot shows a coral-branches-in-cupped-hands icon in ocean navy and bright teal, a wide-tracked "KORAL DIGITAL" wordmark, and "Building a better tomorrow" subtitle. Treat the supplied source image and ./brand-assets/ as the source of styling. Use branded imagery tastefully, not generic SaaS neon/purple. Palette: deep ocean #082E46, ocean navy #073C5B, teal #04A5B8, aqua #23C4C7, warm ivory #FBF8F2, ink #071E2A; Inter or comparable webfont, generous spacing and clean geometric cards. Light-first public marketing with navy/ocean sections; credible, executive-grade interfaces. Assets provided are raster derivatives; preserve/replace with an official vector master if found in repository. Keep ocean imagery elegant and avoid decorative clutter. The favicon should depict the coral/hands mark without small unreadable lettering.

## 1. IMPORTANT CONSTRAINT: FULL-STACK AGENCY OPERATING APP, NOT A CUSTOMER CRM REPLACEMENT

Koral's customers already use tools such as JobNimbus, Jobber, Roofr, AccuLynx, ServiceTitan, HubSpot, HighLevel, Contractor Foreman, etc. Our portal manages **Koral's sales process and service delivery**, while a customer's CRM remains that customer's source of truth. Design reusable integration adapters and service catalog data, but **do not** implement fake production connections or a generic CRM replacement on day one. Run real UI-to-database workflows for Koral's own lead pipeline, clients, projects and customer portal. If vendor API keys or access are unavailable, show "not connected" with an honest setup procedure. Use a clearly marked sandbox demo with synthetic data for prospect presentations, isolated from production records.

## 2. TECH STACK / REPO RULES

- Inspect current repository and relevant README/lockfiles first. Preserve valid existing work. If no app exists, initialize a clean Next.js App Router + TypeScript app. Prefer a maintained stable Next.js version (Next 16 if compatible) and package manager already in repo; do not force upgrades that break build.
- Tailwind CSS + shadcn/ui or accessible equivalents + Lucide icons, responsive desktop/tablet/mobile. Use server components/SSR for public content, client components for interactions. Strong forms, loading/empty/error states and keyboard accessibility.
- PostgreSQL (managed Supabase/Neon is fine), Prisma or Drizzle, schema migrations and reproducible seed for **development only**. Validate inputs with Zod. Provide `.env.example` with no real secrets.
- Authentication: **Descope** via official `@descope/nextjs-sdk`, current documented `AuthProvider`, client-only flow rendering, server-side `session()` and route protection. For Next 16, use `proxy.ts` convention if compatible with the installed SDK rather than assuming `middleware.ts` is current. Read the official Next.js guide and its linked rules: https://docs.descope.com/getting-started/nextjs . Descope Project ID, optional base URL and Flow IDs must be env configured. Use invite-based provisioning and membership, not unrestricted self-signup into an internal role.
- Authorization: database-backed Koral internal roles (superadmin/admin/sales/delivery) and customer workspace roles (client_owner/client_member/read_only), linked securely to Descope identities and membership. Enforce authorization **server-side on every read/write**; never depend on client menu hiding alone. Every customer resource has a tenant/org foreign key. Protect against IDOR and cross-tenant access. Use Descope tenants when appropriate, but make local project membership authoritative for Koral app objects and server-check the mappings. Do not infer privileged Koral role from user-editable metadata or email domain alone. Test cross-tenant denial.
- Hosted deploy target: Vercel for Next.js; managed Postgres; object storage (e.g. Supabase Storage or Vercel Blob with signed URLs) for client documents; Resend or existing email infrastructure for contact notifications, but only when credentials are configured. Keep vendor choices replaceable through adapters; avoid 7 infrastructure accounts before first sale. Vercel and domain config should be documented, not claimed completed if no credentials.
- Observability: structured logs with redaction, error boundaries, audit log, form-spam controls and rate limiting, safe file uploads, env validation, reliable backups via managed provider.
- Payments: fixed-fee proposal/invoice status is essential, payment processing optional. If Stripe credentials are available and user approves, support hosted Checkout/Payment Links for deposit/invoices with verified webhooks and idempotency. Otherwise provide manual invoice/payment-link URL fields and clearly mark offline payments as manually recorded. Never process or store raw card data.
- Optional AI: prefer deterministic routing. Add provider-agnostic interface and a human-reviewed draft mode only when API key exists; disable missing providers transparently. Do not let models auto-approve pricing, client commitments, or send unsolicited messages.

## 3. P0: PUBLIC MARKETING WEBSITE — SHIP FIRST

Produce an exceptionally polished real website, preferably on https://koraldigital.com once deployed, with responsive header, powerful hero, social proof area only for **real** future case studies (show process or use cases instead of fake testimonials), proof-oriented copy, service blocks, clear process, FAQ, interactive lead audit/qualification and repeated consultation CTAs.

Public routes:
- `/` — hero "Get more out of the leads and software you already pay for", service preview, how it works, specific benefits, target industries, proof process, local trust, Koral Initiative teaser, strong booking/contact CTA.
- `/services` and accessible individual pages: `/services/lead-to-booked`, `/services/crm-implementation`, `/services/estimate-follow-up`, `/services/automation-integrations`, `/services/revenue-attribution`, `/services/managed-optimization`, and optionally `/services/websites-lead-generation` (if positioned as available service).
- `/industries` with useful *distinct* content for roofing, remodeling/construction and property maintenance, not copied SEO boilerplate.
- `/about` — factual founder-led company story, engineering/customer-success implementation experience, why vendor-neutral, what makes Koral different; no invented employees or customer logos.
- `/koral-initiative` — accurate future conservation mission and commitment to transparent progress, ocean-science facts only with reliable referenced sources, explicit "planned" status and no fabricated donation claims.
- `/contact` — functional validated inquiry form (name, company, email, phone optional, industry, approximate monthly leads optional, current CRM optional, top problem, consent preferences), server persistence, rate limit, staff notification if email configured, friendly confirmation and error handling.
- `/book` — embedded or linked Calendly **only after link verified**; fallback to contact form if not.
- `/insights` and `/insights/[slug]` — editorial-ready knowledge hub, at least 3 substantive original draft articles with honest draft/published state; publish only vetted accurate articles. Suggested: 'Why contractor leads fall through the cracks', 'When to use your CRM’s native automations vs. integrations', 'Five metrics to track between inquiry and signed job.'
- `/privacy`, `/terms` — professionally structured **draft** templates clearly requiring legal review of actual data processing and vendors before production publication. No fake certifications.
- `/demo` — clearly labeled synthetic lead-to-booked demonstration if feasible; do not share actual client records and keep demo noindex if it has interactive or seeded sample data.

Make every CTA usable: form → persisted DB record → accessible internal pipeline → notification if configured → optional booking. Don't leave dead buttons. Show phone/email only if verified; contact@koraldigital.com and Frisco TX as defaults but editable in admin.

## 4. P0: INTERNAL KORAL PORTAL — MAKE IT OPERATIONAL

Route group `/app` or `/internal`, protected by Descope login and internal-role checks; modern command center with:
- Overview: real DB-derived leads by stage, new inquiries, follow-up tasks, proposals, contracted clients, active projects, overdue actions; no fake revenue numbers or charts.
- Sales CRM: create/update leads, contact/company/industry/source, structured discovery answers, CRM stack, notes, activities, status pipeline (new → contacted → qualified → discovery → proposal → won/lost), owner, next action/due date, search/filter/export CSV; public form submissions should appear automatically here.
- Business profiles / contacts: deduplicated contacts, multiple people per company, domain, industry, software stack, address area, marketing channel, estimated inquiry volumes, notes.
- Discovery/diagnostic checklist and consult booking records.
- Proposals: line items, scope, deliverables, upfront deposit and balance, optional maintenance retainer, draft/sent/accepted status; export/download or print a clean client-facing proposal. Avoid pretending that typed acceptance is legally binding e-signature unless legitimately implemented.
- Convert qualified won leads to customer organizations and client workspaces; invite a client securely only when Descope is configured.
- Projects: template-based onboarding and delivery milestones (discovery, access, audit, configure, test, launch, handoff), owner, status, tasks, due dates, client-visible progress, notes, attachments.
- Client management: organization, memberships, service packages, key contacts, workstreams, connected tools *metadata* (not plaintext secrets), support requests, documents.
- Internal activity/audit log: who changed stage, project status, memberships, proposal/invoice records; support sortable timestamps and tenant scopes.
- Basic managed-service tickets/tasks, manual operations checklist, ability to publish simple client-visible updates.
- Admin settings: business name, email, tagline, booking URL, service offerings/prices, notification destinations, Koral Initiative status/content, SEO defaults, staff accounts/roles. Ensure sensitive actions have explicit permissions.

## 5. P0: CUSTOMER PORTAL — GENUINE MULTI-TENANT ISOLATION

Protected `/portal` and client org context. After staff invite and authenticated access, each customer can:
- See **only their company's** active projects and milestone completion/status.
- View onboarding checklist, outstanding requests (e.g. access granted), project updates and meeting notes marked client-visible.
- Read and submit support requests/questions, with staff responses visible to that client only.
- Download files shared with their organization through expiring signed URLs. Upload only permitted safe types with file-size and malware-handling limitations documented.
- View project scope, proposals and invoice status, booking link, optional results/metrics where verified and supplied.
- Manage their permitted team membership if client_owner; avoid unrestricted elevation or access to Koral staff roles.
- See graceful empty states before first project; nothing suggests nonexistent revenue or active automations.

Use polished navigation and mobile layouts in both portals, with consistent design system and different internal vs client navigation. Provide safe redirect for authenticated users to the right area. Anonymous visitors must never access private data, and clients from org A must not access org B by altering URL identifiers.

## 6. DATA MODEL, SECURITY AND RELIABILITY

Define and migrate appropriate tables/models, at minimum: `users`, `organizations`, `memberships`, `leads`, `contacts`, `lead_activities`, `discovery_answers`, `tasks`, `proposals`, `proposal_items`, `projects`, `project_milestones`, `support_tickets`, `ticket_messages`, `files`, `invoices`, `client_updates`, `integrations` (metadata only), `audit_events`, `articles`, `site_settings`. Add createdAt/updatedAt timestamps, sensible indexes and unique constraints, status enums, soft-delete where appropriate, and multi-tenant org_id column on every customer-owned entity. Separate internal Koral lead pipeline from client end-customer data; the site does not need to ingest customer homeowner PII to sell an implementation pilot.

Include: input validation, accessible error feedback, server auth checks, membership enforcement, file upload safeguards, privacy-conscious logging, least-privilege credentials, route-level and query-level tenant validation, predictable pagination, abuse/rate-limit protection, basic CSRF protections where relevant. Do not silently send contact data to external AI APIs or messaging tools. Do not send automated marketing SMS or email without consent and compliance review. Set up audit logs for critical changes. Ensure no analytics, metadata, logs or server-rendered SEO content leak client data.

## 7. SEARCH ENGINE OPTIMIZATION AND AI SEARCH VISIBILITY — HIGH PRIORITY

This is a brand-new/small company. "Rank #1" and "appear in every LLM" cannot be guaranteed; implement evidence-based discoverability from day one.

**Technical:** SSR/SSG public pages with crawlable semantic text, logical headings, descriptive paths and internal linking, excellent mobile UX/Core Web Vitals, optimized images, reduced JS, alt text, correct per-page title/description, canonical tags, Open Graph/Twitter images, `sitemap.xml`, `robots.txt`, clean redirects, proper 404s, semantic navigation, accessible forms. Generate actual robots/sitemap/metadata functions in Next.js. Public pages indexable; `/app`, `/internal`, `/portal`, login, invitation, demo content and all API routes excluded from indexing as appropriate; protected resources use real auth, not robots.txt security. Handle preview deployments with noindex. Support GSC verification env setting, Google Analytics or privacy-respecting analytics configured behind env/consent where appropriate. Print a SEO launch checklist with manual Search Console submission steps.

**Structured data (truthful and eligible only):** `Organization` with real logo/site/contact, appropriate `ProfessionalService` or `LocalBusiness` if real-world details warrant, `Service` on distinct services, `BreadcrumbList`, and `Article` for published posts. `FAQPage` only for visible substantive FAQs and no promise of rich-results eligibility. No made-up ratings, testimonials, review schema, awards, addresses, opening hours, prices or affiliations. Validate with Google's Rich Results Test. Standardize business name/address/contact across relevant profiles.

**Content / local SEO:** Write credible unique copy for home-service operations in DFW, Roofing CRM Integrations, contractor lead follow-up, job-estimate follow-up, CRM rescue, n8n automations, sales pipeline visibility. Include real service area information (Frisco, Plano, McKinney, Prosper, Celina and North DFW), but avoid dozens of doorway city pages, duplicate AI blogs, keyword stuffing and fake case studies. Use plain-English questions and explicit expert process details that a buyer and an AI answer engine can quote accurately. Publish a factual company/profile page with consistent entity identity; service FAQs, process and data-backed editorial content. Add an optional machine-readable `llms.txt` only if useful as a navigation aid, not as magic SEO; Google states no special AI-search schema or llms.txt requirement. Consider reputable industry references, local chambers, and verified business profiles after launch.

**Measurement:** Add analytics events for consultation CTA clicks, contact form starts/submissions, booking link clicks and lead source; persist UTM parameters if privacy-appropriate; surface basic acquisition/lead-conversion metrics internally. Do not claim customer growth from fabricated figures.

Use authoritative guidance: https://developers.google.com/search/docs/fundamentals/ai-optimization-guide ; https://developers.google.com/search/docs/appearance/structured-data/organization ; https://developers.google.com/search/docs/appearance/structured-data/local-business ; https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap .

## 8. UX AND BUSINESS COPY REQUIREMENTS

Public tone: warm, competent, hands-on, pragmatic, and technically credible. Explain clearly:
- WHO: Koral Digital is a founder-led digital operations, growth and systems integration partner based in Frisco, Texas, serving home-service businesses in North DFW and beyond as practical.
- WHAT: design, implement and optimize lead response, CRM integrations, automated follow-up, operations, reporting, conversion-focused websites and appropriate marketing support.
- FOR WHOM: roofing, construction/remodeling, property maintenance, restoration, local service businesses.
- HOW: Audit → design practical plan → implement existing tools + integrations → test and launch → measure and optimize.
- WHY DIFFERENT: vendor neutral; use the CRM the customer already pays for; human oversight; measurable handoffs and outcomes; clear scopes; no generic AI gimmicks.
- KORAL INITIATIVE: future coral reef conservation/restoration giving; no active giving claims before verified funds disbursed.
- CTA: Book a free consultation / request a workflow audit; plain language outcome.

Provide a transparent "What happens after you contact us" section. Make consultation forms realistic (a business may lack a CRM). If no actual case studies exist, show illustrative workflows clearly labeled as examples, not "results" or testimonials. Support editing content/admin settings without redeploying for every copy change when economical.

## 9. WORK ORDER — DO NOT GET STUCK ON LOW-VALUE FEATURES

1. Inspect repo, tools, current image assets and relevant package docs. Write a concise task checklist in `IMPLEMENTATION_STATUS.md` and then start editing code.
2. Build brand system, site skeleton/navigation, above-the-fold home, services/about/Koral Initiative/contact pages with complete copy and responsive styling. Use authentic asset pack. No lorem ipsum.
3. Implement database schema, migrations, production-safe form submission and actual inquiry persistence; protect inputs, create admin pipeline and real leads list. This establishes first-client readiness early.
4. Wire Descope AuthProvider, sign-in flow, server-side session/role/organization checks, and protected internal portal. If project credentials missing, **fail closed in production**, provide setup steps and keep public pages usable. A clearly marked local-only auth mock is acceptable solely with an explicit development flag disabled in production; never put an insecure bypass behind a production login.
5. Complete client portal, invite/membership flow, real project/task/file/support-ticket workflows and tenant isolation. If provider credentials are unavailable, implement honest "not configured" states, never report success for unverified actions.
6. Add proposal printable document/invoice status, booking CTA, basic analytics, editorial content and SEO metadata/schema, robots/sitemap, noindex for private routes.
7. Run format/lint/typecheck/build/test. Test form persistence, 401/403 behavior, cross-org access, and one happy-path conversion from inquiry → qualified → proposal → client → project → portal visible. Fix errors.
8. Create deploy documentation with env var table and instructions for Postgres, Descope, Vercel, Hostinger DNS, email, booking, storage. If secrets/privileges exist and deployment tool is available, request explicit approval before DNS/domain changes, production credential creation or destructive steps; do not pretend to have deployed otherwise.

If time/space constrains completion, prioritize **public website + real contact capture + internal lead pipeline + authentication + a minimal isolated client project portal** over advanced integrations, billing, CMS and analytics. Record the remaining work honestly. Do not paper over incomplete features with deceptive mock data. Work in meaningful verified increments and keep going without stopping after a general implementation plan.

## 10. DOMAIN AND INFRASTRUCTURE

Domain `koraldigital.com` is registered at Hostinger. You **do not need to transfer registration** to deploy a Next.js app on Vercel or use Cloudflare DNS. Prefer keep registrar at Hostinger for launch, point verified DNS records to Vercel, set canonical www/apex redirects, preserve MX/TXT records for email, and document DNS/SSL. Cloudflare DNS may be configured separately later if desired; actual registrar transfer can take days and creates unnecessary launch risk. Do not change nameservers, delete records or transfer registration without explicit owner approval. Google Domains is not a practical assumption. Ensure mail records and existing contact mailbox survive deployment.

## 11. REQUIRED TESTS AND ACCEPTANCE CRITERIA

- `npm run build` and `npm run lint`/TypeScript checks pass or list precise blocker.
- Marketing pages are responsive and no dead buttons, broken links, fake customer logos, fake donations or placeholder Latin copy.
- A test visitor submits a form. Result appears in real DB and in internal dashboard with status; dedupe and safe error cases work.
- Internal user can add notes, advance lead, create discovery task, draft a proposal, convert lead into a client org, add project milestone and ticket; records survive refresh.
- Invite-based customer can authenticate using actual configured Descope credentials; see their own project/ticket/files but not another organization's. If credentials absent, show the exact blocked setup step, not a fake success.
- Secure server-side authorization covers API routes/server actions, no public leakage of PII, secrets or private metadata.
- Public SEO metadata, schemas, sitemap, robots, OG image, favicon work; portal routes noindexed; no "guaranteed ranking" claims.
- Prospect-facing CTA and contact process are honestly operational, with delivery notification configured or clearly flagged unavailable.
- README provides `pnpm install` or `npm install`, database migrations, env variable setup, sample seed (dev only), authentication setup, local start, tests, deployment, known limitations.

## 12. DELIVERABLES / FINAL REPORT

At end return: (a) what was actually implemented, (b) local run instructions and working commands, (c) tested routes/features and test results, (d) deployment status and exact URL if **actually deployed**, (e) which Descope Project ID/Flow IDs, DB string, email/hosting settings and credentials still need operator action, (f) any security blockers to launch, (g) a first-day sales checklist: domain live, business mailbox, booking tested, admin receives form, payment invoice link, 20 outreach prospects.

If you cannot complete every feature in one session, produce the most commercially usable tested vertical slice with a concise backlog rather than an impressive but broken prototype. Start now.
