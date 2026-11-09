import Link from 'next/link';
import { eq } from 'drizzle-orm';
import { notFound } from 'next/navigation';
import { ActionForm } from '@/components/app/action-form';
import { StatusBadge } from '@/components/app/status-badge';
import { Alert, Card, PageHeader } from '@/components/ui/primitives';
import { Checkbox, Field, Input, Select, Textarea } from '@/components/ui/form';
import { getDb } from '@/db';
import { articleStatusEnum, articles } from '@/db/schema';
import { pageRequireStaff } from '@/lib/auth/guards';
import { titleCase } from '@/lib/utils';
import { saveArticle } from '../actions';

export const metadata = { title: 'Edit article' };

export default async function EditArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await pageRequireStaff('content:write', `/app/content/${id}`);
  if (!/^[0-9a-f-]{36}$/.test(id)) notFound();
  const a = await getDb().query.articles.findFirst({ where: eq(articles.id, id) });
  if (!a) notFound();
  return (
    <>
      <PageHeader
        eyebrow={<Link href="/app/content">← Content</Link>}
        title={a.title}
        actions={
          <>
            <StatusBadge status={a.status} />
            <Link
              href={`/insights/${a.slug}?preview=1`}
              target="_blank"
              className="text-ocean-700 text-sm font-semibold hover:underline"
            >
              Preview
            </Link>
          </>
        }
      />
      <Alert tone="info" className="mb-6" title="Editorial standard">
        Publish only what you can stand behind: no invented statistics, client stories or guarantees.
        Formatting supports ## headings, - bullets, 1. lists, **bold**, *italic*, [links](/path) and &gt;
        quotes.
      </Alert>
      <Card className="p-6">
        <ActionForm action={saveArticle} submitLabel="Save article">
          <input type="hidden" name="articleId" value={a.id} />
          <Field label="Title" htmlFor="title" required>
            <Input id="title" name="title" defaultValue={a.title} required />
          </Field>
          <Field
            label="Meta description"
            htmlFor="description"
            required
            hint="140–160 characters works best in search results."
          >
            <Input id="description" name="description" defaultValue={a.description} required />
          </Field>
          <Field label="Body" htmlFor="body" required>
            <Textarea
              id="body"
              name="body"
              defaultValue={a.body}
              className="min-h-[480px] font-mono text-[13px]"
              required
            />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Status" htmlFor="status" required>
              <Select id="status" name="status" defaultValue={a.status}>
                {articleStatusEnum.enumValues.map((s) => (
                  <option key={s} value={s}>
                    {titleCase(s)}
                  </option>
                ))}
              </Select>
            </Field>
            <Checkbox
              name="reviewed"
              label="I have reviewed this article for accuracy and it contains no unverifiable claims."
              className="self-end pb-2"
            />
          </div>
        </ActionForm>
      </Card>
    </>
  );
}
