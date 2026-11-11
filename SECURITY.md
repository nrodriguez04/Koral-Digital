# Security model

This document describes how the Koral Digital application protects prospect and client data,
and lists the known gaps. Report a vulnerability to the site owner privately (do not open a
public issue).

## Identity and sessions

- **Descope** authenticates users. The session JWT (`DS` cookie, `Secure`, `SameSite=Lax`) is
  validated **server-side** with Descope's signing keys on every request that reads private data
  (`src/lib/auth/descope.ts` → `session()` from `@descope/nextjs-sdk/server`).
- `src/proxy.ts` only redirects obviously-anonymous requests and adds `noindex`/`no-store`
  headers. It is **not** the security boundary — every page, server action and route handler
  re-authorizes.
- If Descope is not configured, nobody can sign in (fail closed). The public site keeps working.
- **Development mock** (`/dev-login`): enabled only when `AUTH_DEV_MOCK=true` **and**
  `NODE_ENV !== 'production'` **and** not running on Vercel. In production builds the page
  returns 404, the server action throws, and the session reader ignores the cookie.

## Authorization (database-backed)

- Internal roles (`superadmin`, `admin`, `sales`, `delivery`) live in `users.staff_role`. They are
  granted only by: an admin through the Team settings (admins cannot mint admins/superadmins), the
  one-time `/setup` token while no staff exists, a staff invitation accepted with a **verified**
  matching email, or the `admin:grant` CLI. Never from email domains, Descope custom attributes or
  anything a user can edit.
- Client roles (`client_owner`, `client_member`, `read_only`) live in `memberships`, created only
  by accepting an invitation. Client owners can invite `client_member`/`read_only` only and cannot
  remove owners.
- Permission matrix: `src/lib/auth/permissions.ts`. Guards: `src/lib/auth/guards.ts`
  (`requireStaff(permission)`, `requireOrgMember(slug, permission)` and page variants).

## Tenant isolation

- Every customer-owned table (`projects`, `project_milestones`, `tasks` for delivery,
  `support_tickets`, `ticket_messages`, `files`, `invoices`, `client_updates`, `integrations`,
  `memberships`, `invitations`, `meetings`, and proposals once converted) carries `org_id`.
- Portal pages resolve the organization **only** from the signed-in user's memberships
  (`requireOrgMember`). A slug or record ID for another org returns **404** (no existence leak).
- Every portal query filters by that `org_id` **and** client visibility (`src/server/portal.ts`).
  Internal ticket notes, internal files, hidden milestones/projects, internal updates and draft
  invoices are never returned to clients.
- Staff write actions verify that referenced projects/proposals belong to the target org.
- Tests: `tests/integration/tenancy.test.ts` (server-level) and `tests/e2e/isolation.spec.ts`
  (browser URL tampering).

## Invitations

- 256-bit random token, stored only as SHA-256, single use, 7-day expiry, older pending invites
  for the same target revoked when a new one is issued.
- If Descope has verified the user's email, it must match the invitation. When delivered through
  the Descope management API the invitation is bound to that Descope user ID.

## Input handling and abuse controls

- All server inputs are validated with Zod; IDs are checked as UUIDs before queries.
- Drizzle parameterizes every query; `ilike` search escapes wildcards.
- Contact form: hidden honeypot, minimum fill time, per-IP (salted daily HMAC, never the raw IP)
  and global rate limits stored in Postgres; generic error messages.
- Server actions use Next.js' built-in Origin/Host check (CSRF protection). The events endpoint
  rejects cross-origin posts. Only same-site relative redirects are honored (`safeNext`).
- CSV export neutralizes spreadsheet formulas. Article markdown is rendered to React elements
  (no raw HTML; only relative or http(s) links).
- JSON-LD is serialized with `<` escaped.

## Files

- S3-compatible private bucket; downloads go through `/api/files/[id]`, which authorizes the user
  and then redirects to a **5-minute** presigned URL with `Content-Disposition: attachment`.
- Uploads: 4 MB max; allowlist of PDF/PNG/JPG/WebP/TXT/CSV/DOCX/XLSX/PPTX checked by extension
  **and** magic bytes; no HTML/SVG/executables; sanitized names; random storage keys.
- **Gap:** no antivirus/malware scanning. Mitigations above reduce risk; add a scanning step
  (e.g. ClamAV worker or a provider feature) before accepting uploads from many clients.

## Data protection

- No secrets or credentials in the database: the "integrations" table stores tool metadata only,
  and notes that look like credentials are rejected.
- Logs are structured JSON with keys like email/phone/name/message/token redacted.
- Audit log (`audit_events`) records who changed stages, proposals, memberships, invitations,
  invoices, files, settings and roles — IDs and statuses only, no message bodies.
- First-party analytics store no IPs, names or emails; Global Privacy Control / Do Not Track
  browsers send nothing.
- Contact data is not sent to AI providers or messaging tools. No automated outbound messages.
- Migration `0001_enable_rls` enables Postgres row-level security on all tables and revokes
  Supabase API roles, so a leaked anon key cannot read data.

## HTTP hardening

`X-Content-Type-Options`, `Referrer-Policy`, `X-Frame-Options: DENY`, `Permissions-Policy`,
HSTS (2 years, preload), `poweredByHeader: false`, private areas `noindex` + `no-store`.

**Gap:** no Content-Security-Policy yet (Next.js inline scripts need a nonce-based CSP; the
Descope web component and the optional Calendly embed need allowances). Recommended next step.

## Secrets

All credentials come from environment variables (see `.env.example`). `APP_SECRET` must be 32+
characters in production or the app refuses to sign. Rotate keys in Vercel and redeploy.
