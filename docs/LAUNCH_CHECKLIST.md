# Koral Digital: same-day launch checklist

## First priority: go live and start sales
- [ ] Create a new Koral Digital repository or open the current repo in Claude Code.
- [ ] Copy `brand-assets/` to the repo and provide `CLAUDE_BUILD_PROMPT.md` to Claude Code.
- [ ] Confirm `koraldigital.com` stays registered with Hostinger; **do not transfer registration** just to deploy.
- [ ] Provision Postgres and share credentials through a secure secrets manager only.
- [ ] Create the Descope project and sign-in/sign-up Flow IDs; set allowed production and localhost origins/redirect URLs.
- [ ] Confirm `contact@koraldigital.com` receives email and check existing MX/SPF/DKIM records before DNS changes.
- [ ] Confirm booking link, use a form fallback if unavailable.
- [ ] Deploy to Vercel (or existing capable host), associate domain, configure records without wiping email DNS.
- [ ] Run a live test: visitor form → DB → internal dashboard → staff notification; then a separate client portal invite test.
- [ ] Verify private routes inaccessible to logged-out and wrong-tenant users.
- [ ] Set up Google Search Console, submit sitemap, test schema and page rendering.
- [ ] Create a real business profile and begin 20 manual, targeted prospect approaches (not unsolicited mass SMS).

## Offer to sell today
**Lead-to-Booked** pilot: scope 1–2 lead sources, CRM intake/deduplication, routing and staff alerts, human-approved response drafts, scheduling handoff, dashboard. Proposed founding price: $2,500 split 50% kickoff / 50% after acceptance; optional $500/month support. Confirm exact deliverables and costs per prospect. All first pilots should have measurable acceptance tests.

## Critical truthfulness notes
- No past-client testimonials, revenue results, donation totals, or conservation partners without evidence.
- Koral Initiative is a planned philanthropic program, not an active percentage-of-profit pledge.
- Do not expose sample prospect data in public search results.
- Do not promise all third-party integration APIs work before testing with real customer accounts.
