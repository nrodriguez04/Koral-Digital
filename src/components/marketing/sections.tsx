import Link from 'next/link';
import type { ReactNode } from 'react';
import { ArrowRight, ChevronRight } from 'lucide-react';
import { ButtonLink } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function SectionHeading({
  eyebrow,
  title,
  intro,
  align = 'left',
  inverse = false,
}: {
  eyebrow?: string;
  title: ReactNode;
  intro?: ReactNode;
  align?: 'left' | 'center';
  inverse?: boolean;
}) {
  return (
    <div className={cn('max-w-3xl', align === 'center' && 'mx-auto text-center')}>
      {eyebrow ? <p className={cn('eyebrow', inverse && 'text-ocean-300')}>{eyebrow}</p> : null}
      <h2
        className={cn(
          'mt-3 text-3xl font-semibold tracking-tight text-balance sm:text-4xl',
          inverse ? 'text-white' : 'text-ink',
        )}
      >
        {title}
      </h2>
      {intro ? (
        <p
          className={cn(
            'mt-4 text-lg leading-relaxed text-pretty',
            inverse ? 'text-white/75' : 'text-ink/70',
          )}
        >
          {intro}
        </p>
      ) : null}
    </div>
  );
}

export function PageHero({
  eyebrow,
  title,
  intro,
  children,
  breadcrumbs,
}: {
  eyebrow?: string;
  title: ReactNode;
  intro?: ReactNode;
  children?: ReactNode;
  breadcrumbs?: { name: string; path: string }[];
}) {
  return (
    <section className="ocean-gradient wave-lines relative overflow-hidden text-white">
      <div className="container-page py-16 sm:py-20 lg:py-24">
        {breadcrumbs ? (
          <nav aria-label="Breadcrumb" className="mb-6">
            <ol className="flex flex-wrap items-center gap-1 text-sm text-white/60">
              {breadcrumbs.map((b, i) => (
                <li key={b.path} className="flex items-center gap-1">
                  {i > 0 ? <ChevronRight className="size-3.5" aria-hidden="true" /> : null}
                  {i < breadcrumbs.length - 1 ? (
                    <Link href={b.path} className="hover:text-white">
                      {b.name}
                    </Link>
                  ) : (
                    <span aria-current="page" className="text-white/85">
                      {b.name}
                    </span>
                  )}
                </li>
              ))}
            </ol>
          </nav>
        ) : null}
        {eyebrow ? <p className="eyebrow text-ocean-300">{eyebrow}</p> : null}
        <h1 className="mt-3 max-w-4xl text-4xl font-semibold tracking-tight text-balance sm:text-5xl lg:text-[3.4rem] lg:leading-[1.08]">
          {title}
        </h1>
        {intro ? (
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-pretty text-white/80">{intro}</p>
        ) : null}
        {children ? <div className="mt-8">{children}</div> : null}
      </div>
    </section>
  );
}

export function CtaBand({
  title = 'Find out where your leads are slipping.',
  body = 'Book a free 30-minute consultation. We will walk through how an inquiry moves through your business today and point out the gaps worth fixing first — whether or not you hire us.',
  label = 'cta_band',
}: {
  title?: string;
  body?: string;
  label?: string;
}) {
  return (
    <section className="container-page py-16 sm:py-20">
      <div className="ocean-gradient wave-lines relative overflow-hidden rounded-[2rem] px-6 py-12 text-white sm:px-12 sm:py-16">
        <div className="max-w-2xl">
          <h2 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">{title}</h2>
          <p className="mt-4 text-lg leading-relaxed text-white/80">{body}</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <ButtonLink
              href="/contact"
              variant="inverse"
              size="lg"
              data-track="cta_click"
              data-track-label={label}
            >
              Book a free consultation <ArrowRight className="size-4" aria-hidden="true" />
            </ButtonLink>
            <ButtonLink
              href="/services/lead-to-booked"
              variant="ghost"
              size="lg"
              className="text-white hover:bg-white/10"
            >
              See the Lead-to-Booked pilot
            </ButtonLink>
          </div>
        </div>
      </div>
    </section>
  );
}

export function FaqList({ faqs }: { faqs: { q: string; a: string }[] }) {
  return (
    <div className="divide-ink/10 border-ink/10 divide-y rounded-[var(--radius-card)] border bg-white">
      {faqs.map((f) => (
        <details key={f.q} className="group px-5 py-4 sm:px-6 [&_summary::-webkit-details-marker]:hidden">
          <summary className="text-ink flex cursor-pointer list-none items-start justify-between gap-4 text-left font-semibold">
            <h3 className="text-base">{f.q}</h3>
            <span
              aria-hidden="true"
              className="bg-ocean-50 text-ocean-700 mt-0.5 inline-flex size-6 shrink-0 items-center justify-center rounded-full transition group-open:rotate-45"
            >
              +
            </span>
          </summary>
          <p className="text-ink/70 mt-3 leading-relaxed">{f.a}</p>
        </details>
      ))}
    </div>
  );
}

export function TextLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      className="text-ocean-700 hover:text-ocean-600 inline-flex items-center gap-1 font-semibold"
    >
      {children} <ArrowRight className="size-4" aria-hidden="true" />
    </Link>
  );
}

export function IllustrativeLabel({
  children = 'Illustrative example — not a client result',
}: {
  children?: ReactNode;
}) {
  return (
    <span className="inline-flex items-center rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-900">
      {children}
    </span>
  );
}
