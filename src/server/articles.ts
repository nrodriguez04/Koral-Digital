import 'server-only';
import { and, desc, eq } from 'drizzle-orm';
import { getDb, isDatabaseConfigured } from '@/db';
import { articles } from '@/db/schema';
import { log } from '@/lib/logger';

export type ArticleRow = typeof articles.$inferSelect;

export async function getPublishedArticles(): Promise<ArticleRow[]> {
  if (!isDatabaseConfigured()) return [];
  try {
    return await getDb()
      .select()
      .from(articles)
      .where(eq(articles.status, 'published'))
      .orderBy(desc(articles.publishedAt));
  } catch (err) {
    log.warn('articles.list_failed', { err });
    return [];
  }
}

export async function getPublishedArticle(slug: string): Promise<ArticleRow | null> {
  if (!isDatabaseConfigured()) return null;
  try {
    const row = await getDb().query.articles.findFirst({
      where: and(eq(articles.slug, slug), eq(articles.status, 'published')),
    });
    return row ?? null;
  } catch (err) {
    log.warn('articles.get_failed', { err });
    return null;
  }
}

export async function getArticleAnyStatus(slug: string): Promise<ArticleRow | null> {
  const row = await getDb().query.articles.findFirst({ where: eq(articles.slug, slug) });
  return row ?? null;
}
