import Link from 'next/link';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { services } from '@/content/services';
import { ContentIcon } from '@/components/marketing/icon';
import { CtaBand, PageHero, SectionHeading } from '@/components/marketing/sections';
import { siteUrl } from '@/lib/env';
import { breadcrumbJsonLd, JsonLd, pageMetadata } from '@/lib/seo';
import { getSiteSettings } from '@/lib/settings';
import { formatUsd } from '@/lib/utils';

export const revalidate = 300;

export const metadata = pageMetadata({
  title: 'Services: lead response, CRM, automation & reporting',
  description:
    'Lead-to-Booked pilots, CRM rescue, estimate follow-up, systems integration, revenue attribution and managed automation for DFW home-service businesses.',
  path: '/services',
});

export default async function ServicesPage() {
  const s = await getSiteSettings();
  const crumbs = [
    { name: 'Home', path: '/' },
    { name: 'Services', path: '/services' },
  ];
  return (
    <>
      <JsonLd data={breadcrumbJsonLd(siteUrl(), crumbs)} />
      <PageHero
        breadcrumbs={crumbs}
        eyebrow="Services"
        title="Make the tools you already pay for work together."
        intro="Koral Digital designs, implements and maintains the systems between an inquiry and a signed job: lead response, CRM, follow-up, integrations and reporting. Consulting first, then fixed-price implementation, then optional managed support."
      />

      <section className="container-page py-16 sm:py-20">
        <div className="grid gap-6 lg:grid-cols-3">
          {[
            [
              '1. Discovery',
              'A free consultation, then (if useful) a paid diagnostic of your lead flow, tools and data.',
            ],
            [
              '2. Fixed-fee implementation',
              'Clear scope, deliverables, acceptance tests and price — agreed in writing before work starts.',
            ],
            [
              '3. Ongoing optimization',
              'Optional monthly support to monitor, maintain and improve what was built.',
            ],
          ].map(([t, b]) => (
            <div key={t} className="card p-6">
              <p className="text-ink font-semibold">{t}</p>
              <p className="text-ink/65 mt-2 text-sm leading-relaxed">{b}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="container-page pb-8">
        <SectionHeading eyebrow="What we do" title="Seven ways we help" />
        <div className="mt-10 space-y-5">
          {services.map((svc) => (
            <article key={svc.slug} className="card grid gap-6 p-6 sm:p-8 lg:grid-cols-12">
              <div className="lg:col-span-5">
                <div className="flex items-center gap-3">
                  <span className="bg-ocean-900 text-ocean-300 flex size-11 items-center justify-center rounded-2xl">
                    <ContentIcon name={svc.icon} className="size-5" />
                  </span>
                  <h2 className="text-xl font-semibold tracking-tight">
                    <Link href={`/services/${svc.slug}`} className="hover:text-ocean-700">
                      {svc.name}
                    </Link>
                  </h2>
                </div>
                <p className="text-ink/70 mt-4 leading-relaxed">{svc.summary}</p>
                {s.pricing.show && svc.pricingKey ? (
                  <p className="text-ocean-800 mt-4 text-sm">
                    {svc.pricingKey === 'pilot'
                      ? `Founding pilots from ${formatUsd(s.pricing.pilotFrom)}`
                      : `Support plans from ${formatUsd(s.pricing.supportFrom)}/month`}
                    <span className="text-ink/50"> · scoped in writing</span>
                  </p>
                ) : null}
                <Link
                  href={`/services/${svc.slug}`}
                  className="text-ocean-700 hover:text-ocean-600 mt-5 inline-flex items-center gap-1 text-sm font-semibold"
                >
                  Details, process and FAQs <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
              </div>
              <ul className="grid gap-3 sm:grid-cols-2 lg:col-span-7">
                {svc.outcomes.slice(0, 4).map((o) => (
                  <li key={o} className="text-ink/75 flex gap-2.5 text-sm leading-relaxed">
                    <CheckCircle2 className="text-ocean-500 mt-0.5 size-4 shrink-0" aria-hidden="true" />
                    {o}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>
      <CtaBand label="services_cta" />
    </>
  );
}
