import { Download, FolderOpen } from 'lucide-react';
import { ActionForm } from '@/components/app/action-form';
import { Alert, Card, CardHeader, EmptyState, PageHeader } from '@/components/ui/primitives';
import { Field } from '@/components/ui/form';
import { pageRequireOrgMember } from '@/lib/auth/guards';
import { memberCan } from '@/lib/auth/permissions';
import { ALLOWED_UPLOAD_EXTENSIONS, storageStatus } from '@/lib/storage';
import { formatDate } from '@/lib/utils';
import { portalFiles } from '@/server/portal';
import { portalUploadFile } from '../actions';

export const metadata = { title: 'Documents' };

export default async function PortalDocuments({ params }: { params: Promise<{ org: string }> }) {
  const { org: slug } = await params;
  const { org, role } = await pageRequireOrgMember(slug);
  const files = await portalFiles(org.id);
  const st = storageStatus();
  return (
    <>
      <PageHeader title="Documents" description="Files shared between your team and Koral Digital. Download links expire after a few minutes." />
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          {files.length === 0 ? (
            <EmptyState icon={<FolderOpen className="size-6" />} title="No documents yet" />
          ) : (
            <ul className="divide-y divide-ink/6">
              {files.map((f) => (
                <li key={f.id} className="flex items-center justify-between gap-3 px-5 py-3 text-sm">
                  <a href={`/api/files/${f.id}`} className="flex items-center gap-2 font-medium hover:text-ocean-700">
                    <Download className="size-4 text-ink/40" aria-hidden="true" /> {f.name}
                  </a>
                  <span className="text-xs text-ink/50">{Math.max(1, Math.round(f.sizeBytes / 1024))} KB · {formatDate(f.createdAt)}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>
        {memberCan(role, 'files:upload') ? (
          <Card>
            <CardHeader title="Share a file with Koral" />
            <div className="space-y-4 p-5">
              {!st.ready ? <Alert tone="warning">Uploads are temporarily unavailable.</Alert> : null}
              <Alert tone="info">Never upload passwords, API keys or customers’ payment details.</Alert>
              <ActionForm action={portalUploadFile} submitLabel="Upload" resetOnSuccess>
                <input type="hidden" name="org" value={org.slug} />
                <Field label="File" htmlFor="file" required hint={`Up to 4 MB: ${ALLOWED_UPLOAD_EXTENSIONS.join(', ')}`}>
                  <input id="file" name="file" type="file" required className="block w-full text-sm" accept={ALLOWED_UPLOAD_EXTENSIONS.map((e) => `.${e}`).join(',')} />
                </Field>
              </ActionForm>
            </div>
          </Card>
        ) : null}
      </div>
    </>
  );
}
