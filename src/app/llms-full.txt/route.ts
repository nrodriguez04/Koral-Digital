import { generalFaqs } from '@/content/faqs';
import { industries } from '@/content/industries';
import { services } from '@/content/services';
import type { Faq } from '@/content/types';
import { siteUrl } from '@/lib/env';
import { llmsIntro } from '@/lib/llms';
import { getSiteSettings } from '@/lib/settings';
import { getPublishedArticles } from '@/server/articles';

export const revalidate = 3600;

/**
 * The whole public site as one Markdown document, so an assistant can answer
 * detailed questions about a service without crawling every page. Built from
 * the same typed content the pages render, so it cannot drift from them.
 */
export async function GET() {
  const base = siteUrl();
  const s = await getSiteSettings();
  const articles = await getPublishedArticles();
  const faqs = (list: Faq[]) => list.flatMap((f) => [`**${f.q}**`, '', f.a, '']);
  const body = [
    ...llmsIntro(base, s),
    '## Frequently asked questions',
    '',
    ...faqs(generalFaqs),
    '## Services',
    '',
    ...services.flatMap((x) => [
      `### ${x.name}`,
      '',
      `URL: ${base}/services/${x.slug}`,
      '',
      x.tagline,
      '',
      `#### ${x.problem.heading}`,
      '',
      ...x.problem.paragraphs.flatMap((p) => [p, '']),
      '#### What changes',
      '',
      ...x.outcomes.map((o) => `- ${o}`),
      '',
      '#### What is included',
      '',
      ...x.included.map((i) => `- ${i.title}: ${i.body}`),
      '',
      '#### How it works',
      '',
      ...x.process.map((p, n) => `${n + 1}. ${p.title}: ${p.body}`),
      '',
      '#### A good fit for',
      '',
      ...x.idealFor.map((i) => `- ${i}`),
      '',
      '#### Not included',
      '',
      ...x.notIncluded.map((i) => `- ${i}`),
      '',
      `Tools commonly worked with: ${x.tools.join(', ')}.`,
      '',
      `#### Illustrative example (not a client result): ${x.exampleWorkflow.title}`,
      '',
      ...x.exampleWorkflow.steps.map((step, n) => `${n + 1}. ${step}`),
      '',
      '#### Questions',
      '',
      ...faqs(x.faqs),
    ]),
    '## Industries',
    '',
    ...industries.flatMap((x) => [
      `### ${x.name}`,
      '',
      `URL: ${base}/industries/${x.slug}`,
      '',
      x.intro,
      '',
      '#### Where inquiries leak',
      '',
      ...x.challenges.map((c) => `- ${c.title}: ${c.body}`),
      '',
      '#### What Koral typically implements',
      '',
      ...x.approach.map((a) => `- ${a.title}: ${a.body}`),
      '',
      '#### Metrics worth watching',
      '',
      ...x.metrics.map((m) => `- ${m.name}: ${m.definition}`),
      '',
      `Common tools: ${x.commonTools.join(', ')}.`,
      '',
      `#### Illustrative example (not a client result): ${x.exampleScenario.title}`,
      '',
      x.exampleScenario.body,
      '',
      '#### Questions',
      '',
      ...faqs(x.faqs),
    ]),
    ...articles.flatMap((a) => [
      `## Insight: ${a.title}`,
      '',
      `URL: ${base}/insights/${a.slug}`,
      '',
      a.body,
      '',
    ]),
  ].join('\n');
  return new Response(body, { headers: { 'content-type': 'text/plain; charset=utf-8' } });
}
