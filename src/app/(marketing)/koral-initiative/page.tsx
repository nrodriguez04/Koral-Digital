import Image from 'next/image';
import { ExternalLink, Waves } from 'lucide-react';
import { initiativeCommitments, initiativeFaqs, reefFacts } from '@/content/initiative';
import { CtaBand, FaqList, PageHero, SectionHeading } from '@/components/marketing/sections';
import { Badge } from '@/components/ui/primitives';
import { siteUrl } from '@/lib/env';
import { breadcrumbJsonLd, faqJsonLd, JsonLd, pageMetadata } from '@/lib/seo';
import { getSiteSettings } from '@/lib/settings';

export const revalidate = 300;

export const metadata = pageMetadata({
  title: 'The Koral Initiative · Our planned reef conservation commitment',
  description:
    'Why coral reefs matter, and how Koral Digital plans to support vetted reef conservation and restoration as the business grows — with transparent, verified reporting.',
  path: '/koral-initiative',
});

export default async function InitiativePage() {
  const s = await getSiteSettings();
  const crumbs = [
    { name: 'Home', path: '/' },
    { name: 'Koral Initiative', path: '/koral-initiative' },
  ];
  return (
    <>
      <JsonLd data={breadcrumbJsonLd(siteUrl(), crumbs)} />
      <JsonLd data={faqJsonLd(initiativeFaqs)} />
      <PageHero
        breadcrumbs={crumbs}
        eyebrow="The Koral Initiative"
        title="Building a better tomorrow — for businesses and for the reefs our name comes from."
        intro="The Koral Initiative is our planned commitment to support coral reef conservation and restoration as Koral Digital grows. It is a promise about how we intend to use our success, made in public so you can hold us to it."
      >
        <div className="inline-flex max-w-2xl items-start gap-3 rounded-2xl bg-white/10 p-4 text-sm text-white ring-1 ring-white/20">
          <Badge tone={s.initiative.status === 'active' ? 'green' : 'amber'} className="mt-0.5">
            {s.initiative.status === 'active' ? 'Active' : 'Status: planned'}
          </Badge>
          <p className="leading-relaxed text-white/85">{s.initiative.statusNote}</p>
        </div>
      </PageHero>

      <section className="container-page grid gap-12 py-16 sm:py-20 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <SectionHeading eyebrow="Why reefs" title="Small builders, enormous impact" />
          <p className="mt-5 text-lg leading-relaxed text-ink/75">
            Coral reefs are some of the most productive ecosystems on Earth, and some of the most threatened. Here is
            what reputable scientific sources say about why they matter — each statement links to its source.
          </p>
          <ul className="mt-8 space-y-4">
            {reefFacts.map((f) => (
              <li key={f.statement} className="card p-5">
                <p className="leading-relaxed text-ink/85">{f.statement}</p>
                <a
                  href={f.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-ocean-700 hover:underline"
                >
                  Source: {f.sourceName} <ExternalLink className="size-3" aria-hidden="true" />
                </a>
              </li>
            ))}
          </ul>
        </div>
        <aside className="lg:col-span-5">
          <div className="sticky top-28 rounded-[var(--radius-card)] bg-white p-8 text-center ring-1 ring-ink/8">
            <Image
              src="/brand/koral-mark-transparent.png"
              alt="Koral Digital mark: coral branches held in cupped hands"
              width={220}
              height={220}
              className="mx-auto"
            />
            <p className="mt-4 font-semibold tracking-[0.2em]">KORAL DIGITAL</p>
            <p className="mt-1 text-sm text-ocean-600">{s.tagline}</p>
            <p className="mt-5 text-sm leading-relaxed text-ink/65">
              Our mark shows coral held in cupped hands: something fragile and foundational, cared for deliberately.
              It is how we try to treat our clients&apos; businesses — and how we hope to treat the reefs.
            </p>
          </div>
        </aside>
      </section>

      <section className="ocean-gradient text-white">
        <div className="container-page py-16 sm:py-20">
          <div className="flex items-center gap-3">
            <Waves className="size-6 text-ocean-300" aria-hidden="true" />
            <p className="eyebrow text-ocean-300">Our commitments</p>
          </div>
          <h2 className="mt-3 max-w-3xl text-3xl font-semibold tracking-tight sm:text-4xl">
            What we will do — and what we will not claim until it is true.
          </h2>
          <ol className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {initiativeCommitments.map((c, i) => (
              <li key={c.title} className="rounded-2xl bg-white/[0.06] p-6 ring-1 ring-white/10">
                <span className="text-sm font-semibold text-ocean-300 tabular-nums">{String(i + 1).padStart(2, '0')}</span>
                <h3 className="mt-2 text-lg font-semibold">{c.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/75">{c.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="container-page py-16 sm:py-20">
        <SectionHeading eyebrow="Progress log" title="Verified contributions" />
        <div className="mt-8 card p-8 text-center">
          <p className="font-semibold">No contributions have been made yet.</p>
          <p className="mx-auto mt-2 max-w-xl text-sm leading-relaxed text-ink/65">
            When Koral Digital makes its first contribution, the recipient organization, date and verified amount will be
            listed here. We will not publish estimates, pledges or projected impact in place of real figures.
          </p>
        </div>
      </section>

      <section className="container-page grid gap-10 pb-8 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <SectionHeading eyebrow="FAQ" title="Honest answers" />
        </div>
        <div className="lg:col-span-8">
          <FaqList faqs={initiativeFaqs} />
        </div>
      </section>
      <CtaBand
        label="initiative_cta"
        title="Good systems build a better tomorrow."
        body="The best way to help the Koral Initiative get started is to let us help your business grow. Book a free consultation."
      />
    </>
  );
}
