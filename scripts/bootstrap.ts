/**
 * Production-safe, idempotent content bootstrap:
 *  - creates default site settings if none exist (never overwrites edits)
 *  - inserts the editorial article drafts if missing (as DRAFTS; publish after review)
 * Contains no synthetic people or customers.
 */
import { eq } from 'drizzle-orm';
import { articleSeeds } from '../src/content/articles';
import { articles, siteSettings } from '../src/db/schema';
import { defaultSiteSettings } from '../src/lib/settings-schema';
import { scriptDb } from './_db';

async function main() {
  if (!process.env.DATABASE_URL) {
    console.warn('[bootstrap] DATABASE_URL not set — skipping.');
    return;
  }
  const { db, client } = scriptDb();
  try {
    const existing = await db.query.siteSettings.findFirst({ where: eq(siteSettings.key, 'site') });
    if (!existing) {
      await db.insert(siteSettings).values({ key: 'site', value: defaultSiteSettings });
      console.log('[bootstrap] Default site settings created.');
    }
    for (const a of articleSeeds) {
      const inserted = await db
        .insert(articles)
        .values({
          slug: a.slug,
          title: a.title,
          description: a.description,
          body: a.body,
          authorName: a.authorName,
          tags: a.tags,
          readingMinutes: a.readingMinutes,
          status: 'draft',
        })
        .onConflictDoNothing({ target: articles.slug })
        .returning({ id: articles.id });
      if (inserted.length) console.log(`[bootstrap] Draft article added: ${a.slug}`);
    }
    console.log('[bootstrap] Done.');
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  console.error('[bootstrap] Failed:', err);
  process.exit(1);
});
