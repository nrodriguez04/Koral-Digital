import 'server-only';
import { and, eq, isNull } from 'drizzle-orm';
import { getDb } from '@/db';
import { files, projects } from '@/db/schema';
import { recordAudit } from '@/lib/audit';
import { auditActor } from '@/lib/auth/guards';
import type { Actor } from '@/lib/auth/session';
import { staffCan } from '@/lib/auth/permissions';
import { log } from '@/lib/logger';
import { newStorageKey, putObject, storageStatus, validateUpload } from '@/lib/storage';

export type UploadResult = { ok: true; id: string } | { ok: false; error: string };

/** Caller must have already authorized `actor` for `orgId` (staff permission or client membership). */
export async function storeOrgFile(
  actor: Actor,
  orgId: string,
  file: File,
  opts: { visibility: 'internal' | 'client'; projectId?: string | null },
): Promise<UploadResult> {
  const st = storageStatus();
  if (!st.ready) return { ok: false, error: `File uploads are unavailable: ${st.reason}` };
  const v = await validateUpload(file);
  if (!v.ok) return v;
  if (opts.projectId) {
    const p = await getDb().query.projects.findFirst({ where: and(eq(projects.id, opts.projectId), eq(projects.orgId, orgId)) });
    if (!p) return { ok: false, error: 'Project not found.' };
  }
  const key = newStorageKey(orgId, v.value.name);
  try {
    await putObject(key, v.value);
  } catch (err) {
    log.error('files.store_failed', { err });
    return { ok: false, error: 'The file could not be stored. Please try again.' };
  }
  const [row] = await getDb()
    .insert(files)
    .values({
      orgId,
      projectId: opts.projectId ?? null,
      name: v.value.name,
      contentType: v.value.contentType,
      sizeBytes: v.value.bytes.length,
      storageDriver: st.driver,
      storageKey: key,
      visibility: opts.visibility,
      uploadedById: actor.user.id,
    })
    .returning({ id: files.id });
  await recordAudit({
    actor: auditActor(actor),
    action: 'file.uploaded',
    entityType: 'file',
    entityId: row!.id,
    orgId,
    metadata: { visibility: opts.visibility, sizeBytes: v.value.bytes.length, contentType: v.value.contentType },
  });
  return { ok: true, id: row!.id };
}

/**
 * Authorizes a download. Staff with clients:read see everything; clients see
 * only `client`-visibility files of orgs they belong to. Returns null when the
 * actor must not learn the file exists.
 */
export async function authorizeFileDownload(actor: Actor, fileId: string) {
  const f = await getDb().query.files.findFirst({ where: and(eq(files.id, fileId), isNull(files.deletedAt)) });
  if (!f) return null;
  if (staffCan(actor.staffRole, 'clients:read')) return f;
  const member = actor.memberships.some((m) => m.orgId === f.orgId);
  if (member && f.visibility === 'client') return f;
  return null;
}
