import type { Metadata } from 'next';
import Link from 'next/link';
import {
  ArrowRight,
  BellRing,
  CalendarCheck2,
  CheckCircle2,
  ClipboardList,
  Copy,
  FileCheck2,
  Globe,
  Handshake,
  LineChart,
  MessageSquareText,
  PhoneMissed,
  Plug,
  ShieldCheck,
  Timer,
  UserCheck,
  Waves,
} from 'lucide-react';
import { generalFaqs } from '@/content/faqs';
import { industries } from '@/content/industries';
import { services } from '@/content/services';
import { ContentIcon } from '@/components/marketing/icon';
import { CtaBand, FaqList, SectionHeading, TextLink } from '@/components/marketing/sections';
import { ButtonLink } from '@/components/ui/button';
import { siteUrl } from '@/lib/env';
import { faqJsonLd, JsonLd, organizationJsonLd, pageMetadata } from '@/lib/seo';
import { getSiteSettings } from '@/lib/settings';
import { formatUsd } from '@/lib/utils';

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSiteSettings();
  return {
    ...pageMetadata({ title: s.seo.defaultTitle, description: s.seo.defaultDescription, path: '/' }),
    title: { absolute: s.seo.defaultTitle },
  };
}

const leaks = [
  {
    icon: Timer,
    title: 'Slow first response',
    body: 'A web form lands in an inbox nobody is watching. By the time someone calls back, the homeowner has already booked the contractor who answered first.',
  },
  {
    icon: PhoneMissed,
    title: 'Missed calls and after-hours inquiries',
    body: 'Calls roll to voicemail during jobs, storms and weekends. There is no record, no callback task and no way to know how many were lost.',
  },
  {
    icon: ClipboardList,
    title: 'Estimates with no next step',
    body: 'Quotes go out and then sit. Follow-up depends on memory, so good opportunities quietly go cold in the CRM.',
  },
  {
    icon: Plug,
    title: 'Tools that do not talk to each other',
    body: 'Ads, call tracking, CRM, calendar and accounting each hold part of the story — so nobody can say which marketing actually produces signed jobs.',
  },
];

const journey = [
  { icon: MessageSquareText, label: 'Inquiry arrives', detail: 'Web form, call, or ad lead' },
  { icon: Copy, label: 'Captured & de-duplicated', detail: 'One record in your CRM' },
  { icon: BellRing, label: 'Routed & alerted', detail: 'Right person, right away' },
  { icon: UserCheck, label: 'Reply drafted', detail: 'A person approves before it sends' },
  { icon: CalendarCheck2, label: 'Estimate booked', detail: 'Handed to your calendar' },
  { icon: LineChart, label: 'Reported', detail: 'Source → appointment → contract' },
];

const steps = [
  {
    title: 'Audit',
    body: 'We map how an inquiry moves through your business today — every tool, handoff and delay — and agree on what to measure.',
  },
  {
    title: 'Plan',
    body: 'You get a practical, written plan with fixed scope, acceptance tests and a clear price. No retainer required to start.',
  },
  {
    title: 'Implement',
    body: 'We configure the tools you already use, connect them where it makes sense and build the workflows, alerts and reports.',
  },
  {
    title: 'Test & launch',
    body: 'Every workflow is tested with realistic scenarios before go-live, and your team is trained on what changed.',
  },
  {
    title: 'Measure & optimize',
    body: 'We compare against the baseline, fix what is not working and hand over documentation you own.',
  },
];

const differentiators = [
  {
    icon: Plug,
    title: 'Vendor-neutral',
    body: 'We do not resell software. We start with the CRM, phone system and calendar you already pay for, and only recommend a change when it clearly fits.',
  },
  {
    icon: UserCheck,
    title: 'Humans stay in charge',
    body: 'Automation and AI can sort, route and draft. A person approves customer-facing messages, pricing and commitments.',
  },
  {
    icon: FileCheck2,
    title: 'Clear, fixed scopes',
    body: 'Every engagement starts with a written scope, deliverables and acceptance tests — so you know exactly what you are buying.',
  },
  {
    icon: LineChart,
    title: 'Measured handoffs',
    body: 'We define the numbers that matter between inquiry and signed job, capture a baseline and report against it honestly.',
  },
  {
    icon: ShieldCheck,
    title: 'You own everything',
    body: 'Accounts, automations and data stay in your name. We document how it all works so you are never locked in.',
  },
  {
    icon: Handshake,
    title: 'Founder-led',
    body: 'You work directly with the person designing and building your systems — not a rotating account team.',
  },
];

export default async function HomePage() {
  const s = await getSiteSettings();
  const base = siteUrl();
  const pilot = services.find((x) => x.slug === 'lead-to-booked');

  return (
    <>
      <JsonLd data={organizationJsonLd(base, s)} />
      <JsonLd data={faqJsonLd(generalFaqs)} />

      {/* Hero */}
      <section className="ocean-gradient wave-lines relative overflow-hidden text-white">
        <div className="container-page grid gap-12 py-16 sm:py-20 lg:grid-cols-12 lg:py-24">
          <div className="lg:col-span-7">
            <p className="text-ocean-200 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium ring-1 ring-white/15">
              <Globe className="size-3.5" aria-hidden="true" /> Remote-first · Working with businesses
              worldwide
            </p>
            <h1 className="mt-6 text-4xl font-semibold tracking-tight text-balance sm:text-5xl lg:text-[3.6rem] lg:leading-[1.05]">
              Get more out of the leads and software you already pay for.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-pretty text-white/80">
              Koral Digital helps roofing, remodeling and home-service businesses stop losing leads in the
              gaps between their ads, phones, CRM, calendar and sales team — so more inquiries turn into
              booked estimates and signed jobs, without replacing the tools you already use.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <ButtonLink
                href="/contact"
                variant="inverse"
                size="lg"
                data-track="cta_click"
                data-track-label="hero_consultation"
              >
                Book a free consultation <ArrowRight className="size-4" aria-hidden="true" />
              </ButtonLink>
              <ButtonLink
                href="/services/lead-to-booked"
                variant="ghost"
                size="lg"
                className="text-white ring-1 ring-white/25 hover:bg-white/10"
              >
                How the 14-day pilot works
              </ButtonLink>
            </div>
            <ul className="mt-10 grid max-w-2xl grid-cols-2 gap-x-6 gap-y-3 text-sm text-white/80 sm:grid-cols-4">
              {['Vendor-neutral', 'Fixed-scope pilots', 'Human-approved automation', 'You own your data'].map(
                (t) => (
                  <li key={t} className="flex items-center gap-2">
                    <CheckCircle2 className="text-ocean-300 size-4 shrink-0" aria-hidden="true" /> {t}
                  </li>
                ),
              )}
            </ul>
          </div>
          <div className="lg:col-span-5">
            <div className="rounded-[1.75rem] bg-white/[0.07] p-5 ring-1 ring-white/15 backdrop-blur-sm sm:p-6">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-white">How a lead should move</p>
                <span className="text-ocean-200 rounded-full bg-white/10 px-2 py-0.5 text-[11px]">
                  Example workflow
                </span>
              </div>
              <ol className="mt-5 space-y-2.5">
                {journey.map((j, i) => (
                  <li
                    key={j.label}
                    className="flex items-center gap-3 rounded-2xl bg-white/[0.06] px-3.5 py-3 ring-1 ring-white/10"
                  >
                    <span className="bg-ocean-500/25 text-ocean-200 flex size-9 shrink-0 items-center justify-center rounded-xl">
                      <j.icon className="size-4.5" aria-hidden="true" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-semibold text-white">
                        <span className="text-ocean-300 tabular-nums">{String(i + 1).padStart(2, '0')}</span>{' '}
                        {j.label}
                      </span>
                      <span className="block text-xs text-white/60">{j.detail}</span>
                    </span>
                  </li>
                ))}
              </ol>
              <p className="mt-4 text-xs leading-relaxed text-white/55">
                Built inside your existing tools. Each step is logged, so you can see where a lead is and why.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Leaks */}
      <section className="container-page py-20 sm:py-24">
        <SectionHeading
          eyebrow="The problem"
          title="Most lost jobs are not lost to price. They are lost in the gaps."
          intro="Home-service teams spend real money to make the phone ring. The leaks happen afterwards — in the handoffs between people and software that were never designed to work together."
        />
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {leaks.map((l) => (
            <div key={l.title} className="card p-6">
              <div className="bg-ocean-50 text-ocean-600 flex size-11 items-center justify-center rounded-2xl">
                <l.icon className="size-5" aria-hidden="true" />
              </div>
              <h3 className="text-ink mt-5 text-lg font-semibold">{l.title}</h3>
              <p className="text-ink/65 mt-2 text-sm leading-relaxed">{l.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Services */}
      <section className="border-ink/8 border-y bg-white">
        <div className="container-page py-20 sm:py-24">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <SectionHeading
              eyebrow="Services"
              title="Practical systems work, scoped and priced up front."
              intro="Start with a focused pilot, fix the CRM you have, or connect the tools that should already be talking. Every engagement is built around measurable handoffs."
            />
            <TextLink href="/services">All services</TextLink>
          </div>
          <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {services.map((svc) => (
              <Link
                key={svc.slug}
                href={`/services/${svc.slug}`}
                className="group card hover:border-ocean-500/40 flex flex-col p-6 transition hover:-translate-y-0.5 hover:shadow-[var(--shadow-lift)]"
              >
                <div className="bg-ocean-900 text-ocean-300 flex size-11 items-center justify-center rounded-2xl">
                  <ContentIcon name={svc.icon} className="size-5" />
                </div>
                <h3 className="text-ink mt-5 text-lg font-semibold">{svc.name}</h3>
                <p className="text-ink/65 mt-2 flex-1 text-sm leading-relaxed">{svc.summary}</p>
                <span className="text-ocean-700 group-hover:text-ocean-600 mt-5 inline-flex items-center gap-1 text-sm font-semibold">
                  Learn more{' '}
                  <ArrowRight className="size-4 transition group-hover:translate-x-0.5" aria-hidden="true" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Flagship offer */}
      {pilot ? (
        <section className="container-page py-20 sm:py-24">
          <div className="grid gap-10 lg:grid-cols-12 lg:gap-14">
            <div className="lg:col-span-6">
              <p className="eyebrow">Start here</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
                Lead-to-Booked: a 14-day, fixed-scope pilot.
              </h2>
              <p className="text-ink/70 mt-4 text-lg leading-relaxed">{pilot.summary}</p>
              {s.pricing.show ? (
                <div className="border-ocean-500/25 bg-ocean-50 mt-6 rounded-2xl border p-5">
                  <p className="text-ocean-900 text-sm">
                    Founding pilots start at{' '}
                    <strong className="text-lg font-semibold">{formatUsd(s.pricing.pilotFrom)}</strong>, with
                    optional ongoing support from{' '}
                    <strong className="font-semibold">{formatUsd(s.pricing.supportFrom)}/month</strong>.
                  </p>
                  <p className="text-ocean-900/70 mt-1.5 text-xs">{s.pricing.note}</p>
                </div>
              ) : null}
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <ButtonLink
                  href="/contact?service=lead-to-booked"
                  size="lg"
                  data-track="cta_click"
                  data-track-label="pilot_section"
                >
                  Ask about a pilot
                </ButtonLink>
                <ButtonLink href="/services/lead-to-booked" variant="outline" size="lg">
                  See full scope
                </ButtonLink>
              </div>
            </div>
            <div className="lg:col-span-6">
              <div className="card p-6 sm:p-8">
                <p className="text-ink text-sm font-semibold">What the pilot covers</p>
                <ul className="mt-5 space-y-4">
                  {pilot.included.slice(0, 6).map((it) => (
                    <li key={it.title} className="flex gap-3">
                      <CheckCircle2 className="text-ocean-500 mt-0.5 size-5 shrink-0" aria-hidden="true" />
                      <span>
                        <span className="text-ink block font-medium">{it.title}</span>
                        <span className="text-ink/65 mt-0.5 block text-sm leading-relaxed">{it.body}</span>
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>
      ) : null}

      {/* Process */}
      <section className="ocean-gradient text-white">
        <div className="container-page py-20 sm:py-24">
          <SectionHeading
            inverse
            eyebrow="How it works"
            title="Audit. Plan. Implement. Test. Measure."
            intro="A deliberate process that respects your crew's time and your customers' trust."
          />
          <ol className="mt-12 grid gap-4 md:grid-cols-5">
            {steps.map((st, i) => (
              <li key={st.title} className="rounded-2xl bg-white/[0.06] p-5 ring-1 ring-white/10">
                <span className="text-ocean-300 text-sm font-semibold tabular-nums">Step {i + 1}</span>
                <h3 className="mt-2 text-lg font-semibold">{st.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/70">{st.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Differentiators */}
      <section className="container-page py-20 sm:py-24">
        <SectionHeading
          eyebrow="Why Koral"
          title="Not another “AI agency.” An implementation partner that answers for the results."
          intro="We are pragmatic about technology. The goal is fewer dropped leads and clearer numbers — not a shiny new tool for your team to ignore."
        />
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {differentiators.map((d) => (
            <div key={d.title} className="flex gap-4 rounded-2xl p-2">
              <div className="bg-ocean-50 text-ocean-600 flex size-11 shrink-0 items-center justify-center rounded-2xl">
                <d.icon className="size-5" aria-hidden="true" />
              </div>
              <div>
                <h3 className="text-ink font-semibold">{d.title}</h3>
                <p className="text-ink/65 mt-1.5 text-sm leading-relaxed">{d.body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Industries */}
      <section className="border-ink/8 bg-sand/60 border-y">
        <div className="container-page py-20 sm:py-24">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <SectionHeading
              eyebrow="Who we help"
              title="Built for the way home-service businesses actually sell."
              intro="Storm surges, long remodeling decisions, recurring work orders, 2 a.m. water emergencies — each trade leaks leads differently."
            />
            <TextLink href="/industries">Industries we serve</TextLink>
          </div>
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {industries.map((ind) => (
              <Link
                key={ind.slug}
                href={`/industries/${ind.slug}`}
                className="group card p-6 transition hover:-translate-y-0.5 hover:shadow-[var(--shadow-lift)]"
              >
                <ContentIcon name={ind.icon} className="text-ocean-600 size-6" />
                <h3 className="mt-4 text-lg font-semibold">{ind.name}</h3>
                <p className="text-ink/65 mt-2 line-clamp-4 text-sm leading-relaxed">{ind.intro}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Proof without fluff */}
      <section className="container-page py-20 sm:py-24">
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
          <div>
            <SectionHeading
              eyebrow="Proof, without the fluff"
              title="We will not show you invented testimonials."
              intro="Koral Digital is a new, founder-led practice. Instead of borrowed logos and inflated numbers, here is what you can hold us to on every engagement."
            />
            <div className="mt-8">
              <TextLink href="/demo">Walk through an example Lead-to-Booked workflow</TextLink>
            </div>
          </div>
          <ul className="grid gap-4 sm:grid-cols-2">
            {[
              [
                'A written scope with acceptance tests',
                'You approve exactly what “done” means before work starts.',
              ],
              [
                'A measured baseline',
                'We record how things work today so improvements are judged against reality, not hope.',
              ],
              ['Documentation you keep', 'Diagrams, settings and runbooks for every workflow we build.'],
              [
                'Your accounts, your data',
                'Everything is built in tools you own. Leave any time without losing anything.',
              ],
            ].map(([t, b]) => (
              <li key={t} className="card p-5">
                <CheckCircle2 className="text-ocean-500 size-5" aria-hidden="true" />
                <p className="mt-3 font-semibold">{t}</p>
                <p className="text-ink/65 mt-1 text-sm leading-relaxed">{b}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Worldwide + Initiative */}
      <section className="container-page grid gap-5 pb-20 lg:grid-cols-2">
        <div className="card p-8">
          <Globe className="text-ocean-600 size-6" aria-hidden="true" />
          <h2 className="mt-4 text-2xl font-semibold tracking-tight">Remote-first. Working worldwide.</h2>
          <p className="text-ink/70 mt-3 leading-relaxed">
            We work with home-service businesses wherever they operate, over video calls and screen shares and
            inside the tools you already use. We schedule around your time zone and build in accounts you own
            wherever possible.
          </p>
        </div>
        <div className="ocean-gradient relative overflow-hidden rounded-[var(--radius-card)] p-8 text-white">
          <Waves className="text-ocean-300 size-6" aria-hidden="true" />
          <h2 className="mt-4 text-2xl font-semibold tracking-tight">The Koral Initiative</h2>
          <p className="mt-3 leading-relaxed text-white/80">
            Our name and our mark come from coral reefs — living systems that protect coastlines and shelter a
            remarkable share of ocean life. As Koral grows, we plan to support vetted reef conservation and
            restoration work, and to publish exactly what we give when we give it.
          </p>
          <div className="mt-5">
            <Link
              href="/koral-initiative"
              className="text-ocean-200 inline-flex items-center gap-1 font-semibold hover:text-white"
            >
              Read about the plan <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      {/* After you contact us */}
      <section className="border-ink/8 border-y bg-white">
        <div className="container-page py-20 sm:py-24">
          <SectionHeading
            eyebrow="No pressure, no surprises"
            title="What happens after you contact us"
            align="center"
          />
          <ol className="mx-auto mt-12 grid max-w-5xl gap-5 md:grid-cols-4">
            {[
              [
                'We reply within one business day',
                'A real person reads your note and replies personally — no automated drip campaign.',
              ],
              [
                'A free 30-minute consultation',
                'We ask how leads arrive, who handles them and which tools you use. Bring your questions.',
              ],
              [
                'A short written recommendation',
                'If there is a fit, you get a plain-English summary of the gaps and the first fix worth making.',
              ],
              [
                'A fixed-scope proposal, if you want one',
                'Clear deliverables, timeline, price and acceptance tests. You decide — no follow-up barrage.',
              ],
            ].map(([t, b], i) => (
              <li key={t} className="bg-ivory ring-ink/8 relative rounded-2xl p-5 ring-1">
                <span className="bg-ocean-500 flex size-8 items-center justify-center rounded-full text-sm font-semibold text-white">
                  {i + 1}
                </span>
                <p className="mt-4 font-semibold">{t}</p>
                <p className="text-ink/65 mt-1.5 text-sm leading-relaxed">{b}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* FAQ */}
      <section className="container-page py-20 sm:py-24">
        <div className="grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <SectionHeading
              eyebrow="FAQ"
              title="Straight answers"
              intro="If your question is not here, ask us directly — that is what the free consultation is for."
            />
          </div>
          <div className="lg:col-span-8">
            <FaqList faqs={generalFaqs} />
          </div>
        </div>
      </section>

      <CtaBand label="home_footer_cta" />
    </>
  );
}
