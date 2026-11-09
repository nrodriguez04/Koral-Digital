import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowRight } from 'lucide-react';
import { industries } from '@/content/industries';
import { services } from '@/content/services';
import { ContentIcon } from '@/components/marketing/icon';
import { CtaBand, FaqList, IllustrativeLabel, PageHero, SectionHeading } from '@/components/marketing/sections';
import { ButtonLink } from '@/components/ui/button';
import { siteUrl } from '@/lib/env';
import { breadcrumbJsonLd, faqJsonLd, JsonLd, pageMetadata } from '@/lib/seo';

export const dynamicParams = false;

export function generateStaticParams() {
  return industries.map((i) => ({ slug: i.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const ind = industries.find((i) => i.slug === slug);
  if (!ind) return {};
  return pageMetadata({ title: ind.metaTitle, description: ind.metaDescription, path: `/industries/${ind.slug}` });
}

export default async function IndustryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const ind = industries.find((i) => i.slug === slug);
  if (!ind) notFound();
  const crumbs = [
    { name: 'Home', path: '/' },
    { name: 'Industries', path: '/industries' },
    { name: ind.name, path: `/industries/${ind.slug}` },
  ];
  const recommended = ind.services.map((x) => services.find((s) => s.slug === x)).filter(Boolean) as typeof services;
  return (
    <>
      <JsonLd data={breadcrumbJsonLd(siteUrl(), crumbs)} />
      <JsonLd data={faqJsonLd(ind.faqs)} />
      <PageHero breadcrumbs={crumbs} eyebrow={ind.name} title={ind.headline} intro={ind.intro}>
        <ButtonLink
          href={`/contact?industry=${encodeURIComponent(ind.slug)}`}
          variant="inverse"
          size="lg"
          data-track="cta_click"
          data-track-label={`industry_hero_${ind.slug}`}
        >
          Book a free consultation <ArrowRight className="size-4" aria-hidden="true" />
        </ButtonLink>
      </PageHero>

      <section className="container-page py-16 sm:py-20">
        <SectionHeading eyebrow="Where leads leak" title={`Common gaps in ${ind.name.toLowerCase()} businesses`} />
        <div className="mt-10 grid gap-5 md:grid-cols-2">
          {ind.challenges.map((c) => (
            <div key={c.title} className="card p-6">
              <h3 className="font-semibold">{c.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink/70">{c.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-y border-ink/8 bg-white">
        <div className="container-page grid gap-12 py-16 sm:py-20 lg:grid-cols-2">
          <div>
            <SectionHeading eyebrow="Our approach" title="What we typically put in place" />
            <ul className="mt-8 space-y-5">
              {ind.approach.map((a) => (
                <li key={a.title}>
                  <h3 className="font-semibold">{a.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-ink/70">{a.body}</p>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <SectionHeading eyebrow="Measure what matters" title="Metrics worth tracking" />
            <dl className="mt-8 divide-y divide-ink/8 rounded-2xl bg-ivory ring-1 ring-ink/8">
              {ind.metrics.map((m) => (
                <div key={m.name} className="p-5">
                  <dt className="font-semibold">{m.name}</dt>
                  <dd className="mt-1 text-sm leading-relaxed text-ink/70">{m.definition}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-4 text-sm text-ink/60">
              Software we often see in this trade: {ind.commonTools.join(', ')}. We work vendor-neutrally with what you
              already use.
            </p>
          </div>
        </div>
      </section>

      <section className="container-page py-16 sm:py-20">
        <div className="ocean-gradient rounded-[var(--radius-card)] p-8 text-white sm:p-10">
          <IllustrativeLabel />
          <h2 className="mt-4 text-2xl font-semibold tracking-tight">{ind.exampleScenario.title}</h2>
          <p className="mt-4 max-w-3xl leading-relaxed text-white/80">{ind.exampleScenario.body}</p>
        </div>
      </section>

      {recommended.length ? (
        <section className="container-page pb-16">
          <SectionHeading eyebrow="Recommended" title="Services that fit" />
          <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {recommended.map((r) => (
              <Link key={r.slug} href={`/services/${r.slug}`} className="card p-5 transition hover:border-ocean-500/40">
                <ContentIcon name={r.icon} className="size-5 text-ocean-600" />
                <p className="mt-3 font-semibold">{r.name}</p>
                <p className="mt-1 line-clamp-3 text-sm text-ink/60">{r.summary}</p>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      <section className="container-page grid gap-10 pb-8 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <SectionHeading eyebrow="FAQ" title={`${ind.name} questions`} />
        </div>
        <div className="lg:col-span-8">
          <FaqList faqs={ind.faqs} />
        </div>
      </section>
      <CtaBand label={`industry_footer_${ind.slug}`} />
    </>
  );
}
