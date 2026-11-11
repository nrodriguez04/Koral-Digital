/**
 * Typed marketing content. Long-form copy lives in version control so it is
 * reviewed like code; operational values (prices, contact details, booking URL,
 * Koral Initiative status) live in site settings and are editable in /app/settings.
 */

/** Icon names map to lucide-react icons in src/components/marketing/icon.tsx */
export type IconName =
  | 'zap'
  | 'database'
  | 'repeat'
  | 'workflow'
  | 'bar-chart'
  | 'shield-check'
  | 'globe'
  | 'home'
  | 'hammer'
  | 'wrench'
  | 'droplets'
  | 'phone-missed'
  | 'calendar-check'
  | 'users'
  | 'clipboard-check'
  | 'line-chart';

export type Faq = { q: string; a: string };

export type ServiceContent = {
  /** URL slug under /services/ */
  slug: string;
  /** Full display name, e.g. "Lead-to-Booked Pilot" */
  name: string;
  /** Short label for nav and cards, e.g. "Lead-to-Booked" */
  shortName: string;
  icon: IconName;
  /** One-line value statement shown under the H1 */
  tagline: string;
  /** 1–2 sentence summary for cards */
  summary: string;
  /** <= 60 chars, will be suffixed with " | Koral Digital" */
  metaTitle: string;
  /** 140–160 chars, plain English, no hype, no guarantees */
  metaDescription: string;
  /** The operational problem in the buyer's words. 2–4 paragraphs. */
  problem: { heading: string; paragraphs: string[] };
  /** What changes for the business. Operational outcomes, NO invented numbers. */
  outcomes: string[];
  /** Concrete deliverables */
  included: { title: string; body: string }[];
  /** How the engagement runs, in order */
  process: { title: string; body: string }[];
  /** Who it is a good fit for */
  idealFor: string[];
  /** Honest boundaries: what this is not */
  notIncluded: string[];
  /** Tools commonly worked with. Vendor-neutral; never implies partnership. */
  tools: string[];
  /** Clearly-labeled illustrative example, never presented as a client result */
  exampleWorkflow: { title: string; steps: string[] };
  faqs: Faq[];
  /** Which configurable price (from site settings) applies, if any */
  pricingKey: 'pilot' | 'support' | null;
  /** Related service slugs */
  related: string[];
};

export type IndustryContent = {
  slug: string;
  name: string;
  icon: IconName;
  metaTitle: string;
  metaDescription: string;
  /** H1 */
  headline: string;
  intro: string;
  /** Industry-specific leak points between inquiry and signed job */
  challenges: { title: string; body: string }[];
  /** What Koral typically implements for this industry */
  approach: { title: string; body: string }[];
  /** Metrics this trade should watch (definitions, not benchmarks) */
  metrics: { name: string; definition: string }[];
  /** Common software in this trade (vendor-neutral) */
  commonTools: string[];
  /** Illustrative example, clearly labeled */
  exampleScenario: { title: string; body: string };
  faqs: Faq[];
  /** Recommended service slugs */
  services: string[];
};

export type ArticleSeed = {
  slug: string;
  title: string;
  /** 140–160 char meta description */
  description: string;
  /** Body in the limited markdown subset rendered by src/lib/markdown.tsx:
   *  ## and ### headings, paragraphs, "- " bullets, "1. " numbered lists,
   *  **bold**, *italic*, [links](/path) and "> " blockquotes. No HTML, no tables, no images. */
  body: string;
  authorName: string;
  /** Approximate reading time in minutes */
  readingMinutes: number;
  tags: string[];
};

export type SourcedFact = {
  /** The fact as it should be displayed, phrased conservatively */
  statement: string;
  sourceName: string;
  sourceUrl: string;
};
