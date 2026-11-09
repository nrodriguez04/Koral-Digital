import { createHash, createHmac } from 'node:crypto';

/** RFC 3986 encoding as required by AWS SigV4. */
export function rfc3986(s: string) {
  return encodeURIComponent(s).replace(/[!'()*]/g, (c) => `%${c.charCodeAt(0).toString(16).toUpperCase()}`);
}

const hmac = (key: Buffer | string, data: string) => createHmac('sha256', key).update(data, 'utf8').digest();
const sha256hex = (data: string) => createHash('sha256').update(data, 'utf8').digest('hex');

export type PresignInput = {
  method: 'GET' | 'PUT' | 'DELETE';
  endpoint: string;
  region: string;
  bucket: string;
  key: string;
  accessKeyId: string;
  secretAccessKey: string;
  expiresSeconds: number;
  forcePathStyle: boolean;
  now?: Date;
  query?: Record<string, string>;
};

/** Builds an AWS Signature V4 query-string presigned URL (works with S3, R2, Supabase Storage S3). */
export function presignUrl(i: PresignInput): string {
  const ep = new URL(i.endpoint);
  const basePath = ep.pathname.replace(/\/$/, '');
  const encodedKey = i.key.split('/').map(rfc3986).join('/');
  const host = i.forcePathStyle ? ep.host : `${i.bucket}.${ep.host}`;
  const canonicalUri = i.forcePathStyle ? `${basePath}/${rfc3986(i.bucket)}/${encodedKey}` : `${basePath}/${encodedKey}`;
  const now = i.now ?? new Date();
  const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, '');
  const date = amzDate.slice(0, 8);
  const scope = `${date}/${i.region}/s3/aws4_request`;
  const params: Record<string, string> = {
    'X-Amz-Algorithm': 'AWS4-HMAC-SHA256',
    'X-Amz-Credential': `${i.accessKeyId}/${scope}`,
    'X-Amz-Date': amzDate,
    'X-Amz-Expires': String(i.expiresSeconds),
    'X-Amz-SignedHeaders': 'host',
    ...(i.query ?? {}),
  };
  const canonicalQuery = Object.keys(params)
    .sort()
    .map((k) => `${rfc3986(k)}=${rfc3986(params[k]!)}`)
    .join('&');
  const canonicalRequest = [i.method, canonicalUri, canonicalQuery, `host:${host}\n`, 'host', 'UNSIGNED-PAYLOAD'].join('\n');
  const stringToSign = ['AWS4-HMAC-SHA256', amzDate, scope, sha256hex(canonicalRequest)].join('\n');
  const kDate = hmac(`AWS4${i.secretAccessKey}`, date);
  const kRegion = hmac(kDate, i.region);
  const kService = hmac(kRegion, 's3');
  const kSigning = hmac(kService, 'aws4_request');
  const signature = createHmac('sha256', kSigning).update(stringToSign, 'utf8').digest('hex');
  return `${ep.protocol}//${host}${canonicalUri}?${canonicalQuery}&X-Amz-Signature=${signature}`;
}
