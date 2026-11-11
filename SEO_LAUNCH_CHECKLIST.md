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
- [x] JSON-LD: `Organization` + `ProfessionalService` (headquarters city/region, `areaServed: Worldwide` and an `OfferCatalog` of the services — no street address, hours, prices or ratings), `WebSite`, `Service` per service page, `BreadcrumbList`, `FAQPage` only where the same Q&A is visible, `Article` for published posts
- [x] Favicon/app icons from the coral-in-hands mark, web manifest, theme color
- [x] Self-hosted font, optimized images, minimal client JavaScript on marketing pages
- [x] `llms.txt` (summary, key facts and links) and `llms-full.txt` (every service, industry and FAQ in one document), both built from the same content the pages render
- [x] `robots.txt` names the AI search and assistant crawlers (GPTBot, OAI-SearchBot, ClaudeBot, Claude-SearchBot, PerplexityBot, Google-Extended and others) and allows the public site
- [x] A definitional "What is Koral Digital?" FAQ on the home page, written to be quoted as-is
- [x] Internal linking: services ↔ industries ↔ related services ↔ contact
- [x] Worldwide positioning: no service-area list or city pages; Frisco, TX is stated once as headquarters
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
7. **Let AI crawlers through the edge.** If DNS or the CDN runs through Cloudflare, turn off
   "Block AI bots" / AI Crawl Control for the public site (new Cloudflare zones block them by
   default), and check Vercel Firewall rules do the same. `robots.txt` allowing them is not enough
   if the edge returns 403. Then fetch `/llms.txt` and `/robots.txt` from outside your network.
8. **Google Business Profile** (optional for a remote business) — if you create one, make it a
   **service-area business** with the street address hidden, a category such as "Business
   management consultant", and website = koraldigital.com. Do not list a narrow set of cities.
9. **Consistent entity description** — use exactly "Koral Digital", the same one-sentence
   description ("founder-led operations and automation partner for home-service businesses
   worldwide"), the same website URL and (once verified) the same email on LinkedIn, Crunchbase,
   Clutch, Google Business Profile, Bing Places and any directory you join. AI answers lean on
   consistent third-party mentions, not just your own site.

## First 30 days

- [ ] Review and publish the three draft articles in `/app/content` (fact-check every sentence).
- [ ] Mark the contact email and booking link as verified in `/app/settings` once tested.
- [ ] Ask the first pilot clients for honest Google reviews **after** delivering results (never incentivized, never written for them).
- [ ] Publish one practical article every 2–4 weeks answering a real question prospects asked you.
- [ ] Join and get listed by real industry organizations (NARI, roofing and restoration associations, CRM vendors' partner directories) — genuine citations beat directory spam.
- [ ] Each month, ask ChatGPT, Claude, Perplexity, Gemini and Copilot the questions prospects ask ("who can fix lead follow-up for a roofing company?", "what is Koral Digital?") and note whether Koral appears and whether the description is right. Fix wrong facts at the source page, then in `llms.txt`.
- [ ] Answer real questions where prospects and assistants read them (industry forums, LinkedIn articles, podcast guest spots) and link back to the matching service page.
- [ ] When you have permission and verified outcomes, add case studies (real names, real numbers, signed approval).
- [ ] Check Search Console → Pages and Enhancements weekly for errors.

## Do not

- Create one page per city or country with swapped names (doorway pages).
- Publish AI-generated articles without expert review, fake reviews, review schema you didn't earn, or invented statistics.
- Promise "#1 rankings" or "guaranteed inclusion in ChatGPT".
