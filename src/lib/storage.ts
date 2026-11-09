import 'server-only';
import { mkdir, readFile, unlink, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { env, isProduction } from './env';
import { log } from './logger';
import { presignUrl } from './sigv4';

export const MAX_UPLOAD_BYTES = 4 * 1024 * 1024; // stays under serverless request limits

/** Allowlist with magic-byte signatures. No HTML/SVG/executables (no inline-renderable active content). */
const TYPES: Record<string, { ext: string[]; magic?: (b: Buffer) => boolean }> = {
  'application/pdf': { ext: ['pdf'], magic: (b) => b.subarray(0, 5).toString() === '%PDF-' },
  'image/png': {
    ext: ['png'],
    magic: (b) => b.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])),
  },
  'image/jpeg': { ext: ['jpg', 'jpeg'], magic: (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff },
  'image/webp': {
    ext: ['webp'],
    magic: (b) => b.subarray(0, 4).toString() === 'RIFF' && b.subarray(8, 12).toString() === 'WEBP',
  },
  'text/plain': { ext: ['txt'] },
  'text/csv': { ext: ['csv'] },
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': { ext: ['docx'], magic: isZip },
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': { ext: ['xlsx'], magic: isZip },
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': {
    ext: ['pptx'],
    magic: isZip,
  },
};

function isZip(b: Buffer) {
  return b[0] === 0x50 && b[1] === 0x4b && b[2] === 0x03 && b[3] === 0x04;
}

export const ALLOWED_UPLOAD_EXTENSIONS = Object.values(TYPES).flatMap((t) => t.ext);

export function sanitizeFileName(name: string) {
  const base = name.split(/[\\/]/).pop() ?? 'file';
  return (
    base
      .replace(/[^\w.\- ]+/g, '_')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 120) || 'file'
  );
}

export type ValidatedUpload = { name: string; contentType: string; bytes: Buffer };

export async function validateUpload(
  file: File,
): Promise<{ ok: true; value: ValidatedUpload } | { ok: false; error: string }> {
  if (!file || file.size === 0) return { ok: false, error: 'Choose a file to upload.' };
  if (file.size > MAX_UPLOAD_BYTES) return { ok: false, error: 'Files must be 4 MB or smaller.' };
  const name = sanitizeFileName(file.name);
  const ext = name.split('.').pop()?.toLowerCase() ?? '';
  const entry = Object.entries(TYPES).find(([, t]) => t.ext.includes(ext));
  if (!entry)
    return {
      ok: false,
      error: `That file type is not allowed. Allowed: ${ALLOWED_UPLOAD_EXTENSIONS.join(', ')}.`,
    };
  const [contentType, spec] = entry;
  const bytes = Buffer.from(await file.arrayBuffer());
  if (spec.magic && !spec.magic(bytes))
    return { ok: false, error: 'The file contents do not match its extension.' };
  if (!spec.magic && bytes.subarray(0, 4096).includes(0))
    return { ok: false, error: 'Text files must not contain binary data.' };
  return { ok: true, value: { name, contentType, bytes } };
}

export type StorageStatus = { driver: 's3' | 'local' | 'none'; ready: boolean; reason?: string };

export function storageStatus(): StorageStatus {
  const e = env();
  if (e.STORAGE_DRIVER === 's3') {
    const missing = ['S3_ENDPOINT', 'S3_BUCKET', 'S3_ACCESS_KEY_ID', 'S3_SECRET_ACCESS_KEY'].filter(
      (k) => !e[k as keyof typeof e],
    );
    return missing.length
      ? { driver: 's3', ready: false, reason: `Missing ${missing.join(', ')}` }
      : { driver: 's3', ready: true };
  }
  if (e.STORAGE_DRIVER === 'local') {
    if (isProduction())
      return { driver: 'local', ready: false, reason: 'Local disk storage is disabled in production.' };
    return { driver: 'local', ready: true };
  }
  return { driver: 'none', ready: false, reason: 'File storage is not configured (STORAGE_DRIVER).' };
}

const LOCAL_ROOT = path.join(process.cwd(), '.uploads');

function s3Presign(
  method: 'GET' | 'PUT' | 'DELETE',
  key: string,
  expiresSeconds: number,
  query?: Record<string, string>,
) {
  const e = env();
  return presignUrl({
    method,
    endpoint: e.S3_ENDPOINT!,
    region: e.S3_REGION,
    bucket: e.S3_BUCKET!,
    key,
    accessKeyId: e.S3_ACCESS_KEY_ID!,
    secretAccessKey: e.S3_SECRET_ACCESS_KEY!,
    expiresSeconds,
    forcePathStyle: e.S3_FORCE_PATH_STYLE !== 'false',
    query,
  });
}

export function newStorageKey(orgId: string, name: string) {
  return `orgs/${orgId}/${randomUUID()}-${name.replace(/\s+/g, '_')}`;
}

export async function putObject(key: string, upload: ValidatedUpload) {
  const st = storageStatus();
  if (!st.ready) throw new Error(st.reason ?? 'Storage not configured');
  if (st.driver === 'local') {
    const target = path.join(LOCAL_ROOT, key);
    if (!target.startsWith(LOCAL_ROOT)) throw new Error('Invalid key');
    await mkdir(path.dirname(target), { recursive: true });
    await writeFile(target, upload.bytes);
    return;
  }
  const res = await fetch(s3Presign('PUT', key, 300), {
    method: 'PUT',
    body: new Uint8Array(upload.bytes),
    headers: { 'content-type': upload.contentType },
    signal: AbortSignal.timeout(20_000),
  });
  if (!res.ok) {
    log.error('storage.put_failed', { status: res.status });
    throw new Error('Upload to storage failed');
  }
}

/** Expiring signed download URL (S3) — 5 minutes, forced as attachment. */
export function signedDownloadUrl(key: string, fileName: string) {
  return s3Presign('GET', key, 300, {
    'response-content-disposition': `attachment; filename="${fileName.replace(/"/g, '')}"`,
  });
}

export async function readLocalObject(key: string) {
  const target = path.join(LOCAL_ROOT, key);
  if (!target.startsWith(LOCAL_ROOT)) throw new Error('Invalid key');
  return readFile(target);
}

export async function deleteObject(driver: string, key: string) {
  try {
    if (driver === 'local') await unlink(path.join(LOCAL_ROOT, key));
    else if (driver === 's3') await fetch(s3Presign('DELETE', key, 120), { method: 'DELETE' });
  } catch (err) {
    log.warn('storage.delete_failed', { err });
  }
}
