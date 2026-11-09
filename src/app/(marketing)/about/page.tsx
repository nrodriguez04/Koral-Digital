import { CheckCircle2 } from 'lucide-react';
import { CtaBand, PageHero, SectionHeading } from '@/components/marketing/sections';
import { siteUrl } from '@/lib/env';
import { breadcrumbJsonLd, JsonLd, organizationJsonLd, pageMetadata } from '@/lib/seo';
import { getSiteSettings } from '@/lib/settings';

export const revalidate = 300;

export const metadata = pageMetadata({
  title: 'About Koral Digital · Founder-led, vendor-neutral',
  description:
    'Koral Digital is a founder-led operations and automation partner in Frisco, Texas, helping home-service businesses connect the tools they already pay for.',
  path: '/about',
});

const beliefs = [
  [
    'Use what you already pay for',
    'Most businesses do not need new software. They need the software they have configured properly and connected to the rest of the business.',
  ],
  [
    'People first, automation second',
    'Automation should remove busywork, not judgement. Customer-facing messages, pricing and commitments stay with your team.',
  ],
  [
    'Measure the handoffs',
    'If we cannot measure it, we cannot honestly say it improved. We define the numbers up front and report against them.',
  ],
  [
    'Scope it, then build it',
    'Fixed scopes, written acceptance tests and plain-English proposals. No open-ended retainers to get started.',
  ],
  [
    'Leave it better documented than we found it',
    'Every engagement ends with documentation your team can use — and that the next person can understand.',
  ],
];

export default async function AboutPage() {
  const s = await getSiteSettings();
  const base = siteUrl();
  const crumbs = [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about' },
  ];
  return (
    <>
      <JsonLd data={breadcrumbJsonLd(base, crumbs)} />
      <JsonLd data={organizationJsonLd(base, s)} />
      <PageHero
        breadcrumbs={crumbs}
        eyebrow="About"
        title="A founder-led partner for the unglamorous systems that win jobs."
        intro={`${s.businessName} is a digital operations, automation and systems-integration consultancy based in ${s.city}, Texas. We help home-service businesses turn more inquiries into booked estimates and signed work — using the tools they already have.`}
      />

      <section className="container-page grid gap-12 py-16 sm:py-20 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <SectionHeading eyebrow="Our story" title="From lead generation to the systems behind it" />
          <div className="text-ink/75 mt-6 space-y-4 text-lg leading-relaxed">
            <p>
              Koral Digital started in lead generation and digital marketing for roofing, solar and
              home-service businesses: Google Ads, websites and landing pages, marketing strategy and
              analytics.
            </p>
            <p>
              That work kept surfacing the same pattern. Generating inquiries was only half the job. Leads
              arrived and then waited — in an inbox, in a voicemail box, in a CRM nobody fully trusted.
              Estimates went out and were never followed up. And because the ad platform, the phones and the
              CRM did not share data, nobody could say with confidence which marketing produced signed jobs.
            </p>
            <p>
              So we refocused on the gap itself. Today Koral Digital is a vendor-neutral implementation and
              operations partner: we design, implement and look after the lead response, CRM, follow-up,
              integration and reporting systems that sit between a homeowner&apos;s first inquiry and a signed
              contract. We still build conversion-focused websites and manage paid search where it fits, but
              always in service of that bigger picture.
            </p>
          </div>
        </div>
        <aside className="lg:col-span-5">
          <div className="card p-7">
            <p className="eyebrow">Founder</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight">{s.founderName}</h2>
            <p className="text-ink/75 mt-4 leading-relaxed whitespace-pre-line">{s.founderBio}</p>
            {s.linkedinUrl ? (
              <a
                href={s.linkedinUrl}
                target="_blank"
                rel="noopener noreferrer me"
                className="text-ocean-700 mt-5 inline-block text-sm font-semibold hover:underline"
              >
                Connect on LinkedIn →
              </a>
            ) : null}
          </div>
        </aside>
      </section>

      <section className="border-ink/8 border-y bg-white">
        <div className="container-page py-16 sm:py-20">
          <SectionHeading
            eyebrow="Why vendor-neutral"
            title="We do not earn commissions on the software we recommend."
            intro="That means our advice is about what fits your business — including, often, sticking with what you already have. When a change does make sense, we explain the trade-offs in writing."
          />
          <ul className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {beliefs.map(([t, b]) => (
              <li key={t} className="bg-ivory ring-ink/8 rounded-2xl p-6 ring-1">
                <CheckCircle2 className="text-ocean-500 size-5" aria-hidden="true" />
                <h3 className="mt-3 font-semibold">{t}</h3>
                <p className="text-ink/65 mt-2 text-sm leading-relaxed">{b}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="container-page py-16 sm:py-20">
        <div className="grid gap-10 lg:grid-cols-2">
          <div>
            <SectionHeading eyebrow="Our name" title="Why “Koral”?" />
            <p className="text-ink/75 mt-5 text-lg leading-relaxed">
              Coral reefs are built slowly by small organisms working together, and they end up sheltering an
              enormous amount of life and protecting the coastlines behind them. That is how we think about
              good business systems: quiet, well-connected foundations that protect the work people do every
              day. Our mark — coral held in cupped hands — and our tagline, “{s.tagline}”, reflect that idea,
              and the{' '}
              <a href="/koral-initiative" className="text-ocean-700 font-semibold hover:underline">
                Koral Initiative
              </a>{' '}
              is our plan to support the real reefs as we grow.
            </p>
          </div>
          <div>
            <SectionHeading eyebrow="Where we work" title={`Based in ${s.city}, ${s.region}`} />
            <p className="text-ink/75 mt-5 text-lg leading-relaxed">
              We work in person with businesses across North Dallas–Fort Worth — {s.serviceAreas.join(', ')} —
              and remotely with home-service companies in other markets when the work can be done well that
              way.
            </p>
          </div>
        </div>
      </section>
      <CtaBand label="about_cta" />
    </>
  );
}
