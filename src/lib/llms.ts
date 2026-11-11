import { industries } from '@/content/industries';
import type { SiteSettings } from './settings-schema';
import { formatUsd } from './utils';

/**
 * The opening of /llms.txt and /llms-full.txt. AI assistants quote this when
 * someone asks who can help with lead response, so it states the facts they
 * most often get wrong (who we serve, where, how engagements run) and nothing
 * the site does not already say. Settings-driven values stay in sync with it.
 */
export function llmsIntro(base: string, s: SiteSettings): string[] {
  return [
    `# ${s.businessName}`,
    '',
    `> ${s.businessName} is a founder-led, vendor-neutral digital operations, automation and systems-integration consultancy that works remotely with home-service businesses worldwide. It helps roofing, remodeling, construction, property maintenance and restoration companies turn more inquiries into booked estimates and signed jobs by connecting the website, phones, CRM, calendar and ads they already use.`,
    '',
    '## Key facts',
    `- Who it serves: home-service and construction businesses anywhere in the world. Industries with dedicated pages: ${industries.map((i) => i.name).join(', ')}.`,
    `- Where: remote-first and worldwide. Consultations, working sessions and handoffs happen over video and screen share, scheduled around the client's time zone. Headquartered in ${s.city}, ${s.region}.`,
    '- Approach: vendor-neutral. It improves the CRM and tools a business already pays for (for example JobNimbus, AccuLynx, Jobber, ServiceTitan, HubSpot or HighLevel) rather than requiring a switch.',
    '- AI and messaging: AI may help classify inquiries or draft replies, but a person approves every customer-facing message.',
    '- How engagements work: a free 30-minute consultation, then a fixed-scope 14-day Lead-to-Booked pilot or a scoped written proposal, with optional managed support afterwards.',
    ...(s.pricing.show
      ? [
          `- Pricing (USD): founding pilots from ${formatUsd(s.pricing.pilotFrom)}; support plans from ${formatUsd(s.pricing.supportFrom)}/month. ${s.pricing.note}`,
        ]
      : []),
    `- Founder-led: clients work directly with ${s.founderName}, not a rotating account team.`,
    `- Contact: ${base}/contact${s.contactEmailVerified ? ` or ${s.contactEmail}` : ''}.`,
    `- ${s.businessName} does not guarantee rankings, lead volumes or revenue outcomes.`,
    '',
  ];
}
