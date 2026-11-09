import { NextResponse } from 'next/server';
import { recordAudit } from '@/lib/audit';
import { auditActor } from '@/lib/auth/guards';
import { getActor } from '@/lib/auth/session';
import { readLocalObject, signedDownloadUrl } from '@/lib/storage';
import { authorizeFileDownload } from '@/server/files';

export const dynamic = 'force-dynamic';

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const actor = await getActor();
  if (!actor) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!/^[0-9a-f-]{36}$/.test(id)) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  const file = await authorizeFileDownload(actor, id);
  if (!file) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  await recordAudit({ actor: auditActor(actor), action: 'file.downloaded', entityType: 'file', entityId: file.id, orgId: file.orgId });
  const headers = {
    'cache-control': 'private, no-store',
    'x-content-type-options': 'nosniff',
    'x-robots-tag': 'noindex',
  };
  if (file.storageDriver === 's3') {
    return NextResponse.redirect(signedDownloadUrl(file.storageKey, file.name), { status: 302, headers });
  }
  if (file.storageDriver === 'local' && process.env.NODE_ENV !== 'production') {
    const bytes = await readLocalObject(file.storageKey);
    return new NextResponse(new Uint8Array(bytes), {
      headers: {
        ...headers,
        'content-type': file.contentType,
        'content-disposition': `attachment; filename="${file.name.replace(/"/g, '')}"`,
      },
    });
  }
  return NextResponse.json({ error: 'Storage unavailable' }, { status: 503 });
}
