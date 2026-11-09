# SEO & AI-search launch checklist

No one can guarantee rankings or inclusion in AI answers. What this site does is give search
engines and answer engines accurate, crawlable, well-structured information — then the work is
consistency, real reviews over time, and useful content.

## Already implemented in code

- [x] Server-rendered/static public pages with one H1, logical headings and descriptive URLs
- [x] Per-page `<title>`, meta description, canonical URL, Open Graph and Twitter cards (`/brand/og-image-1200x630.jpg`)
- [x] `sitemap.xml` (public pages + published articles only), `robots.txt` (blocks `/app`, `/portal`, `/api`, auth pages, `/demo`)
- [x] Preview deployments and non-production hosts are `noindex` and robots-disallowed (`SITE_INDEXING=auto`)
- [x] Private areas send `X-Robots-Tag: noindex` and are protected by real authentication
- [x] JSON-LD: `Organization` + `ProfessionalService` (city/region and service area only — no street address, hours, prices or ratings), `WebSite`, `Service` per service page, `BreadcrumbList`, `FAQPage` only where the same Q&A is visible, `Article` for published posts
- [x] Favicon/app icons from the coral-in-hands mark, web manifest, theme color
- [x] Self-hosted font, optimized images, minimal client JavaScript on marketing pages
- [x] `llms.txt` as a plain-text navigation summary (a convenience, not a ranking factor)
- [x] Internal linking: services ↔ industries ↔ related services ↔ contact
- [x] Local relevance: Frisco base and named North DFW service areas, without doorway pages
- [x] First-party analytics for CTA clicks, form starts/submits, booking clicks and UTM source

## Do on launch day (owner actions)

1. **Confirm production URL** is `https://koraldigital.com` (www redirects to it) and `NEXT_PUBLIC_SITE_URL` matches.
2. **Google Search Console**
   - Add a **Domain property** for `koraldigital.com` and verify with the TXT record Google gives
     you (add it in Hostinger DNS — it does not affect email). Alternatively use a URL-prefix
     property with the HTML tag value in `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION`.
   - Sitemaps → submit `https://koraldigital.com/sitemap.xml`.
   - URL Inspection → request indexing for `/`, `/services`, `/services/lead-to-booked`, `/about`, `/contact`.
3. **Bing Webmaster Tools** → import from Search Console (also feeds Copilot/ChatGPT search, which use Bing's index).
4. **Rich Results Test** (search.google.com/test/rich-results) on `/`, `/services/lead-to-booked`,
   `/industries/roofing`, `/koral-initiative` — expect Organization, Breadcrumb and FAQ items to be
   detected. FAQ rich results are limited by Google to certain sites, so detection ≠ display.
5. **Schema Markup Validator** (validator.schema.org) on the same pages — zero errors.
6. **PageSpeed Insights** on `/` (mobile) — aim for green Core Web Vitals.
7. **Google Business Profile** — create a **service-area business** (hide the street address),
   category such as "Business management consultant" or "Marketing consultant", service areas
   Frisco/Plano/McKinney/Prosper/Celina/Allen, website = koraldigital.com, same name everywhere.
8. **Consistent NAP** — use exactly "Koral Digital", "Frisco, TX", the same website URL and (once
   verified) the same email/phone on LinkedIn, Google Business Profile, Bing Places, the Frisco
   Chamber of Commerce and any directories you join.

## First 30 days

- [ ] Review and publish the three draft articles in `/app/content` (fact-check every sentence).
- [ ] Mark the contact email and booking link as verified in `/app/settings` once tested.
- [ ] Ask the first pilot clients for honest Google reviews **after** delivering results (never incentivized, never written for them).
- [ ] Publish one practical article every 2–4 weeks answering a real question prospects asked you.
- [ ] Join and get listed by real local organizations (Frisco Chamber, NARI/roofing associations) — genuine citations beat directory spam.
- [ ] When you have permission and verified outcomes, add case studies (real names, real numbers, signed approval).
- [ ] Check Search Console → Pages and Enhancements weekly for errors.

## Do not

- Create one page per city with swapped names (doorway pages).
- Publish AI-generated articles without expert review, fake reviews, review schema you didn't earn, or invented statistics.
- Promise "#1 rankings" or "guaranteed inclusion in ChatGPT".
