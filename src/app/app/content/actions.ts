'use server';

import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { getDb } from '@/db';
import { articleStatusEnum, articles } from '@/db/schema';
import { recordAudit } from '@/lib/audit';
import { auditActor, requireStaff, runAction, type ActionResult } from '@/lib/auth/guards';

export async function saveArticle(_p: ActionResult<unknown>, fd: FormData): Promise<ActionResult<unknown>> {
  return runAction(async () => {
    const actor = await requireStaff('content:write');
    const parsed = z
      .object({
        articleId: z.string().uuid(),
        title: z.string().trim().min(5).max(200),
        description: z.string().trim().min(20).max(200),
        body: z.string().min(50).max(60000),
        status: z.enum(articleStatusEnum.enumValues),
        reviewed: z.string().optional(),
      })
      .safeParse(Object.fromEntries(fd));
    if (!parsed.success)
      return {
        ok: false,
        error: 'Please check the article.',
        fieldErrors: parsed.error.flatten().fieldErrors,
      };
    const d = parsed.data;
    const db = getDb();
    const a = await db.query.articles.findFirst({ where: eq(articles.id, d.articleId) });
    if (!a) return { ok: false, error: 'Article not found.' };
    if (d.status === 'published' && a.status !== 'published' && d.reviewed !== 'on') {
      return { ok: false, error: 'Confirm you have reviewed the article for accuracy before publishing.' };
    }
    const words = d.body.split(/\s+/).filter(Boolean).length;
    await db
      .update(articles)
      .set({
        title: d.title,
        description: d.description,
        body: d.body,
        status: d.status,
        readingMinutes: Math.max(1, Math.round(words / 230)),
        publishedAt: d.status === 'published' ? (a.publishedAt ?? new Date()) : a.publishedAt,
        reviewedById: d.status === 'published' ? actor.user.id : a.reviewedById,
      })
      .where(eq(articles.id, a.id));
    await recordAudit({
      actor: auditActor(actor),
      action: 'article.saved',
      entityType: 'article',
      entityId: a.id,
      metadata: { from: a.status, to: d.status },
    });
    revalidatePath('/insights');
    revalidatePath(`/insights/${a.slug}`);
    revalidatePath('/sitemap.xml');
    revalidatePath('/app/content');
    return { ok: true, message: d.status === 'published' ? 'Published — live on /insights.' : 'Saved.' };
  });
}
