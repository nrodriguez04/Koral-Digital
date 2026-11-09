import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowRight, CheckCircle2, MinusCircle } from 'lucide-react';
import { services } from '@/content/services';
import { ContentIcon } from '@/components/marketing/icon';
import { CtaBand, FaqList, IllustrativeLabel, PageHero, SectionHeading } from '@/components/marketing/sections';
import { ButtonLink } from '@/components/ui/button';
import { siteUrl } from '@/lib/env';
import { breadcrumbJsonLd, faqJsonLd, JsonLd, pageMetadata, serviceJsonLd } from '@/lib/seo';
import { getSiteSettings } from '@/lib/settings';
import { formatUsd } from '@/lib/utils';

export const revalidate = 300;
export const dynamicParams = false;

export function generateStaticParams() {
  return services.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const svc = services.find((s) => s.slug === slug);
  if (!svc) return {};
  return pageMetadata({ title: svc.metaTitle, description: svc.metaDescription, path: `/services/${svc.slug}` });
}

export default async function ServicePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const svc = services.find((s) => s.slug === slug);
  if (!svc) notFound();
  const s = await getSiteSettings();
  const base = siteUrl();
  const crumbs = [
    { name: 'Home', path: '/' },
    { name: 'Services', path: '/services' },
    { name: svc.shortName, path: `/services/${svc.slug}` },
  ];
  const related = svc.related.map((r) => services.find((x) => x.slug === r)).filter(Boolean) as typeof services;

  return (
    <>
      <JsonLd data={breadcrumbJsonLd(base, crumbs)} />
      <JsonLd
        data={serviceJsonLd(base, {
          name: svc.name,
          description: svc.metaDescription,
          path: `/services/${svc.slug}`,
          areas: s.serviceAreas,
        })}
      />
      <JsonLd data={faqJsonLd(svc.faqs)} />

      <PageHero breadcrumbs={crumbs} eyebrow="Service" title={svc.name} intro={svc.tagline}>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <ButtonLink
            href={`/contact?service=${svc.slug}`}
            variant="inverse"
            size="lg"
            data-track="cta_click"
            data-track-label={`service_hero_${svc.slug}`}
          >
            Talk to us about {svc.shortName} <ArrowRight className="size-4" aria-hidden="true" />
          </ButtonLink>
          {s.pricing.show && svc.pricingKey ? (
            <p className="text-sm text-white/75">
              {svc.pricingKey === 'pilot'
                ? `Founding pilots from ${formatUsd(s.pricing.pilotFrom)}`
                : `Plans from ${formatUsd(s.pricing.supportFrom)}/month`}{' '}
              · {s.pricing.note}
            </p>
          ) : null}
        </div>
      </PageHero>

      <section className="container-page grid gap-12 py-16 sm:py-20 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <h2 className="text-3xl font-semibold tracking-tight text-balance">{svc.problem.heading}</h2>
          <div className="mt-6 space-y-4 text-lg leading-relaxed text-ink/75">
            {svc.problem.paragraphs.map((p) => (
              <p key={p.slice(0, 40)}>{p}</p>
            ))}
          </div>
        </div>
        <aside className="lg:col-span-5">
          <div className="card p-6 sm:p-7">
            <p className="font-semibold text-ink">What changes</p>
            <ul className="mt-4 space-y-3">
              {svc.outcomes.map((o) => (
                <li key={o} className="flex gap-2.5 text-sm leading-relaxed text-ink/75">
                  <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-ocean-500" aria-hidden="true" />
                  {o}
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </section>

      <section className="border-y border-ink/8 bg-white">
        <div className="container-page py-16 sm:py-20">
          <SectionHeading eyebrow="Deliverables" title="What is included" />
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {svc.included.map((it) => (
              <div key={it.title} className="rounded-2xl bg-ivory p-6 ring-1 ring-ink/8">
                <ContentIcon name={svc.icon} className="size-5 text-ocean-600" />
                <h3 className="mt-3 font-semibold text-ink">{it.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink/65">{it.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container-page grid gap-12 py-16 sm:py-20 lg:grid-cols-2">
        <div>
          <SectionHeading eyebrow="Process" title="How the engagement runs" />
          <ol className="mt-8 space-y-5">
            {svc.process.map((p, i) => (
              <li key={p.title} className="flex gap-4">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-ocean-900 text-sm font-semibold text-white">
                  {i + 1}
                </span>
                <div>
                  <h3 className="font-semibold">{p.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-ink/65">{p.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
        <div className="space-y-6">
          <div className="card p-6">
            <h2 className="font-semibold">A good fit if…</h2>
            <ul className="mt-4 space-y-2.5">
              {svc.idealFor.map((x) => (
                <li key={x} className="flex gap-2.5 text-sm text-ink/75">
                  <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-ocean-500" aria-hidden="true" />
                  {x}
                </li>
              ))}
            </ul>
          </div>
          <div className="card p-6">
            <h2 className="font-semibold">What this is not</h2>
            <ul className="mt-4 space-y-2.5">
              {svc.notIncluded.map((x) => (
                <li key={x} className="flex gap-2.5 text-sm text-ink/75">
                  <MinusCircle className="mt-0.5 size-4 shrink-0 text-ink/40" aria-hidden="true" />
                  {x}
                </li>
              ))}
            </ul>
          </div>
          <div className="card p-6">
            <h2 className="font-semibold">Tools we commonly work with</h2>
            <p className="mt-1 text-xs text-ink/55">
              Vendor-neutral — no reseller or partner arrangements. Integration depth depends on each vendor&apos;s API
              access and your plan.
            </p>
            <ul className="mt-4 flex flex-wrap gap-2">
              {svc.tools.map((t) => (
                <li key={t} className="rounded-full bg-ink/[0.05] px-3 py-1 text-xs font-medium text-ink/75">
                  {t}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="ocean-gradient text-white">
        <div className="container-page py-16 sm:py-20">
          <IllustrativeLabel />
          <h2 className="mt-4 text-2xl font-semibold tracking-tight sm:text-3xl">{svc.exampleWorkflow.title}</h2>
          <ol className="mt-8 grid gap-3 md:grid-cols-2">
            {svc.exampleWorkflow.steps.map((st, i) => (
              <li key={st} className="flex gap-3 rounded-2xl bg-white/[0.06] p-4 ring-1 ring-white/10">
                <span className="text-sm font-semibold text-ocean-300 tabular-nums">{String(i + 1).padStart(2, '0')}</span>
                <span className="text-sm leading-relaxed text-white/85">{st}</span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="container-page grid gap-10 py-16 sm:py-20 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <SectionHeading eyebrow="FAQ" title={`${svc.shortName} questions`} />
        </div>
        <div className="lg:col-span-8">
          <FaqList faqs={svc.faqs} />
        </div>
      </section>

      {related.length ? (
        <section className="container-page pb-4">
          <h2 className="text-lg font-semibold">Related services</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            {related.map((r) => (
              <Link key={r.slug} href={`/services/${r.slug}`} className="card p-5 transition hover:border-ocean-500/40">
                <p className="font-semibold">{r.name}</p>
                <p className="mt-1 line-clamp-2 text-sm text-ink/60">{r.summary}</p>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      <CtaBand label={`service_footer_${svc.slug}`} />
    </>
  );
}
