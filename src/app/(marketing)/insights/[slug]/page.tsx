import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { CtaBand } from '@/components/marketing/sections';
import { Alert } from '@/components/ui/primitives';
import { getActor } from '@/lib/auth/session';
import { staffCan } from '@/lib/auth/permissions';
import { siteUrl } from '@/lib/env';
import { renderMarkdown } from '@/lib/markdown';
import { articleJsonLd, breadcrumbJsonLd, JsonLd, pageMetadata } from '@/lib/seo';
import { formatDate } from '@/lib/utils';
import { getArticleAnyStatus, getPublishedArticle } from '@/server/articles';

export const revalidate = 300;

type Props = { params: Promise<{ slug: string }>; searchParams: Promise<{ preview?: string }> };

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { slug } = await params;
  const { preview } = await searchParams;
  const a = await getPublishedArticle(slug);
  if (!a) return preview ? { title: 'Draft preview', robots: { index: false, follow: false } } : {};
  return pageMetadata({
    title: a.title,
    description: a.description,
    path: `/insights/${a.slug}`,
    type: 'article',
    publishedTime: a.publishedAt?.toISOString(),
    modifiedTime: a.updatedAt.toISOString(),
  });
}

export default async function ArticlePage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { preview } = await searchParams;
  let article = await getPublishedArticle(slug);
  let isPreview = false;
  if (!article && preview === '1') {
    // Draft preview is staff-only and enforced server-side.
    const actor = await getActor();
    if (actor && staffCan(actor.staffRole, 'content:write')) {
      article = await getArticleAnyStatus(slug);
      isPreview = Boolean(article);
    }
  }
  if (!article) notFound();
  const base = siteUrl();
  const crumbs = [
    { name: 'Home', path: '/' },
    { name: 'Insights', path: '/insights' },
    { name: article.title, path: `/insights/${article.slug}` },
  ];
  return (
    <>
      {!isPreview && article.publishedAt ? (
        <>
          <JsonLd data={breadcrumbJsonLd(base, crumbs)} />
          <JsonLd
            data={articleJsonLd(base, {
              title: article.title,
              description: article.description,
              slug: article.slug,
              authorName: article.authorName,
              publishedAt: article.publishedAt,
              updatedAt: article.updatedAt,
            })}
          />
        </>
      ) : null}
      <article className="container-page py-14 sm:py-20">
        <div className="mx-auto max-w-3xl">
          {isPreview ? (
            <Alert tone="warning" title={`Staff preview — status: ${article.status}`} className="mb-8">
              This article is not public. Publish it from the content admin after review.
            </Alert>
          ) : null}
          <nav aria-label="Breadcrumb" className="text-sm text-ink/55">
            <Link href="/insights" className="hover:text-ink">
              ← All insights
            </Link>
          </nav>
          <h1 className="mt-6 text-4xl font-semibold tracking-tight text-balance sm:text-5xl">{article.title}</h1>
          <p className="mt-4 text-lg leading-relaxed text-ink/70">{article.description}</p>
          <p className="mt-6 text-sm text-ink/55">
            By {article.authorName}
            {article.publishedAt ? ` · ${formatDate(article.publishedAt)}` : ''} · {article.readingMinutes} min read
          </p>
          <div className="prose-koral mt-10">{renderMarkdown(article.body)}</div>
        </div>
      </article>
      <CtaBand label={`article_${article.slug}`} />
    </>
  );
}
