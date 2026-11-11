import { industries } from '@/content/industries';
import { services } from '@/content/services';
import { siteUrl } from '@/lib/env';
import { llmsIntro } from '@/lib/llms';
import { getSiteSettings } from '@/lib/settings';
import { getPublishedArticles } from '@/server/articles';

export const revalidate = 3600;

/**
 * Plain-text map of the public site for AI assistants and answer engines
 * (llmstxt.org convention). Not a search ranking factor; it gives assistants an
 * accurate summary to quote and points them at /llms-full.txt for the detail.
 */
export async function GET() {
  const base = siteUrl();
  const s = await getSiteSettings();
  const articles = await getPublishedArticles();
  const body = [
    ...llmsIntro(base, s),
    '## Services',
    ...services.map((x) => `- [${x.name}](${base}/services/${x.slug}): ${x.summary}`),
    '',
    '## Industries',
    ...industries.map((x) => `- [${x.name}](${base}/industries/${x.slug}): ${x.metaDescription}`),
    '',
    ...(articles.length
      ? [
          '## Insights',
          ...articles.map((a) => `- [${a.title}](${base}/insights/${a.slug}): ${a.description}`),
          '',
        ]
      : []),
    '## Company',
    `- [About](${base}/about): Company story, founder and approach.`,
    `- [Contact](${base}/contact): Request a free consultation.`,
    `- [Full text](${base}/llms-full.txt): Every service, industry and FAQ in one plain-text document.`,
    '',
    '## Optional',
    `- [Koral Initiative](${base}/koral-initiative): Planned future reef-conservation giving program (no contributions made yet; progress will be published there).`,
    `- [Privacy](${base}/privacy)`,
    `- [Terms](${base}/terms)`,
    '',
  ].join('\n');
  return new Response(body, { headers: { 'content-type': 'text/plain; charset=utf-8' } });
}
