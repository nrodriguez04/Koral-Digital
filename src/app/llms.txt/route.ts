import { industries } from '@/content/industries';
import { services } from '@/content/services';
import { siteUrl } from '@/lib/env';
import { getSiteSettings } from '@/lib/settings';

export const revalidate = 3600;

/**
 * Optional plain-text navigation aid (llmstxt.org convention). Not an SEO
 * ranking factor; it simply summarizes the public site accurately.
 */
export async function GET() {
  const base = siteUrl();
  const s = await getSiteSettings();
  const body = [
    `# ${s.businessName}`,
    '',
    `> ${s.businessName} is a founder-led digital operations, automation and systems-integration consultancy based in ${s.city}, ${s.region}. It helps home-service businesses (roofing, remodeling/construction, property maintenance, restoration) in North Dallas–Fort Worth and remotely turn more inquiries into booked estimates and signed jobs using the tools they already use. Vendor-neutral; humans approve customer-facing messages. Tagline: "${s.tagline}"`,
    '',
    '## Services',
    ...services.map((x) => `- [${x.name}](${base}/services/${x.slug}): ${x.summary}`),
    '',
    '## Industries',
    ...industries.map((x) => `- [${x.name}](${base}/industries/${x.slug}): ${x.intro.split('. ')[0]}.`),
    '',
    '## Company',
    `- [About](${base}/about): Company story, founder and approach.`,
    `- [Koral Initiative](${base}/koral-initiative): Planned future reef-conservation giving program (no contributions made yet; progress will be published there).`,
    `- [Insights](${base}/insights): Practical articles for home-service operators.`,
    `- [Contact](${base}/contact): Request a free consultation.`,
    '',
    '## Notes',
    `- Service area: ${s.serviceAreas.join(', ')}, and remote engagements elsewhere in the US.`,
    '- Koral Digital does not guarantee rankings, lead volumes or revenue outcomes.',
    '',
  ].join('\n');
  return new Response(body, { headers: { 'content-type': 'text/plain; charset=utf-8' } });
}
