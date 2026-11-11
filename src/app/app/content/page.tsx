import Link from 'next/link';
import { desc } from 'drizzle-orm';
import { StatusBadge } from '@/components/app/status-badge';
import { Card, PageHeader, Table, Td, Th } from '@/components/ui/primitives';
import { getDb } from '@/db';
import { articles } from '@/db/schema';
import { pageRequireStaff } from '@/lib/auth/guards';
import { formatDate } from '@/lib/utils';

export const metadata = { title: 'Insights content' };

export default async function ContentPage() {
  await pageRequireStaff('content:write', '/app/content');
  const rows = await getDb().select().from(articles).orderBy(desc(articles.updatedAt));
  return (
    <>
      <PageHeader
        title="Insights content"
        description="Articles are created as drafts. Review each one for accuracy, then publish — published articles go live on /insights and the sitemap."
      />
      <Card>
        <Table>
          <thead>
            <tr>
              <Th>Article</Th>
              <Th>Status</Th>
              <Th>Published</Th>
              <Th>Updated</Th>
              <Th />
            </tr>
          </thead>
          <tbody>
            {rows.map((a) => (
              <tr key={a.id}>
                <Td>
                  <Link href={`/app/content/${a.id}`} className="hover:text-ocean-700 font-semibold">
                    {a.title}
                  </Link>
                  <div className="text-ink/50 text-xs">
                    /insights/{a.slug} · {a.readingMinutes} min
                  </div>
                </Td>
                <Td>
                  <StatusBadge status={a.status} />
                </Td>
                <Td className="text-ink/60">{formatDate(a.publishedAt)}</Td>
                <Td className="text-ink/60">{formatDate(a.updatedAt)}</Td>
                <Td>
                  <Link
                    href={`/insights/${a.slug}?preview=1`}
                    target="_blank"
                    className="text-ocean-700 text-sm font-semibold hover:underline"
                  >
                    Preview
                  </Link>
                </Td>
              </tr>
            ))}
          </tbody>
        </Table>
        {rows.length === 0 ? (
          <p className="text-ink/55 p-5 text-sm">
            No articles. Run <code>npm run db:bootstrap</code> to load the editorial drafts.
          </p>
        ) : null}
      </Card>
    </>
  );
}
