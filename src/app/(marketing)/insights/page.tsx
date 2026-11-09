import Link from 'next/link';
import { ArrowRight, BookOpen } from 'lucide-react';
import { CtaBand, PageHero } from '@/components/marketing/sections';
import { EmptyState } from '@/components/ui/primitives';
import { siteUrl } from '@/lib/env';
import { breadcrumbJsonLd, JsonLd, pageMetadata } from '@/lib/seo';
import { formatDate } from '@/lib/utils';
import { getPublishedArticles } from '@/server/articles';

export const revalidate = 300;

export const metadata = pageMetadata({
  title: 'Insights for home-service operators',
  description:
    'Practical, vendor-neutral articles on lead response, CRM automation, estimate follow-up and the metrics between inquiry and signed job for home-service businesses.',
  path: '/insights',
});

export default async function InsightsPage() {
  const posts = await getPublishedArticles();
  const crumbs = [
    { name: 'Home', path: '/' },
    { name: 'Insights', path: '/insights' },
  ];
  return (
    <>
      <JsonLd data={breadcrumbJsonLd(siteUrl(), crumbs)} />
      <PageHero
        breadcrumbs={crumbs}
        eyebrow="Insights"
        title="Field notes on the systems between inquiry and signed job."
        intro="Practical, vendor-neutral writing for owners and office managers of roofing, remodeling and home-service businesses. No hype, no invented statistics."
      />
      <section className="container-page py-14 sm:py-20">
        {posts.length === 0 ? (
          <div className="card">
            <EmptyState
              icon={<BookOpen className="size-6" />}
              title="Our first articles are in editorial review."
            >
              We publish only after a careful accuracy review. In the meantime, the{' '}
              <Link href="/services" className="text-ocean-700 font-semibold hover:underline">
                service pages
              </Link>{' '}
              explain our process in detail.
            </EmptyState>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((p) => (
              <article key={p.id} className="card flex flex-col p-6">
                <p className="text-ink/55 text-xs">
                  {formatDate(p.publishedAt)} · {p.readingMinutes} min read
                </p>
                <h2 className="mt-3 text-xl font-semibold tracking-tight">
                  <Link href={`/insights/${p.slug}`} className="hover:text-ocean-700">
                    {p.title}
                  </Link>
                </h2>
                <p className="text-ink/65 mt-3 flex-1 text-sm leading-relaxed">{p.description}</p>
                <Link
                  href={`/insights/${p.slug}`}
                  className="text-ocean-700 hover:text-ocean-600 mt-5 inline-flex items-center gap-1 text-sm font-semibold"
                >
                  Read article <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
              </article>
            ))}
          </div>
        )}
      </section>
      <CtaBand label="insights_cta" />
    </>
  );
}
