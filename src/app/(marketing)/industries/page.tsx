import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { industries } from '@/content/industries';
import { ContentIcon } from '@/components/marketing/icon';
import { CtaBand, PageHero } from '@/components/marketing/sections';
import { siteUrl } from '@/lib/env';
import { breadcrumbJsonLd, JsonLd, pageMetadata } from '@/lib/seo';

export const metadata = pageMetadata({
  title: 'Industries: roofing, remodeling, property maintenance, restoration',
  description:
    'How Koral Digital helps DFW roofing, remodeling, construction, property maintenance and restoration companies respond faster and follow up consistently.',
  path: '/industries',
});

export default function IndustriesPage() {
  const crumbs = [
    { name: 'Home', path: '/' },
    { name: 'Industries', path: '/industries' },
  ];
  return (
    <>
      <JsonLd data={breadcrumbJsonLd(siteUrl(), crumbs)} />
      <PageHero
        breadcrumbs={crumbs}
        eyebrow="Industries"
        title="Every trade leaks leads in its own way."
        intro="We focus on home-service and construction businesses where speed, follow-up and clean handoffs decide who wins the job. Here is how we think about each one."
      />
      <section className="container-page py-16 sm:py-20">
        <div className="grid gap-6 md:grid-cols-2">
          {industries.map((ind) => (
            <article key={ind.slug} className="card flex flex-col p-7">
              <ContentIcon name={ind.icon} className="size-7 text-ocean-600" />
              <h2 className="mt-4 text-2xl font-semibold tracking-tight">
                <Link href={`/industries/${ind.slug}`} className="hover:text-ocean-700">
                  {ind.name}
                </Link>
              </h2>
              <p className="mt-3 leading-relaxed text-ink/70">{ind.intro}</p>
              <ul className="mt-5 flex-1 space-y-2 text-sm text-ink/70">
                {ind.challenges.slice(0, 3).map((c) => (
                  <li key={c.title} className="flex gap-2">
                    <span className="mt-2 size-1.5 shrink-0 rounded-full bg-ocean-500" aria-hidden="true" />
                    {c.title}
                  </li>
                ))}
              </ul>
              <Link
                href={`/industries/${ind.slug}`}
                className="mt-6 inline-flex items-center gap-1 text-sm font-semibold text-ocean-700 hover:text-ocean-600"
              >
                {ind.name}: challenges, approach and metrics <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </article>
          ))}
        </div>
        <p className="mt-10 max-w-3xl text-ink/65">
          Run a different kind of local service business — HVAC, plumbing, electrical, landscaping, solar? The same
          lead-response and follow-up principles usually apply. <Link href="/contact" className="font-semibold text-ocean-700 hover:underline">Tell us how your leads arrive</Link> and we will say honestly whether we can help.
        </p>
      </section>
      <CtaBand label="industries_cta" />
    </>
  );
}
