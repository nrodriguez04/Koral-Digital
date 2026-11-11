import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { createElement, Fragment } from 'react';
import { safeNext } from '@/lib/auth/redirects';
import { CLIENT_ASSIGNABLE_ROLES, grantableStaffRoles, memberCan, staffCan } from '@/lib/auth/permissions';
import { csvCell } from '@/lib/csv';
import { parseBusinessDate, toBusinessInput } from '@/lib/dates';
import { redact } from '@/lib/logger';
import { renderMarkdown } from '@/lib/markdown';
import { proposalTotals } from '@/lib/proposal-math';
import { presignUrl } from '@/lib/sigv4';
import { sanitizeFileName, validateUpload } from '@/lib/storage';
import { domainFromEmail, normalizeCompanyName } from '@/lib/utils';

describe('open-redirect protection', () => {
  it('allows only known same-site areas', () => {
    expect(safeNext('/app/leads?stage=new')).toBe('/app/leads?stage=new');
    expect(safeNext('/portal/acme')).toBe('/portal/acme');
    expect(safeNext('//evil.com')).toBeNull();
    expect(safeNext('https://evil.com/app')).toBeNull();
    expect(safeNext('/\\evil.com')).toBeNull();
    expect(safeNext('/apple')).toBeNull();
    expect(safeNext(undefined)).toBeNull();
  });
});

describe('role permissions', () => {
  it('limits staff capabilities by role', () => {
    expect(staffCan('sales', 'leads:write')).toBe(true);
    expect(staffCan('sales', 'settings:write')).toBe(false);
    expect(staffCan('delivery', 'leads:write')).toBe(false);
    expect(staffCan('delivery', 'projects:write')).toBe(true);
    expect(staffCan(null, 'leads:read')).toBe(false);
    expect(staffCan('admin', 'staff:manage')).toBe(true);
  });
  it('never lets admins mint superadmins or clients mint staff', () => {
    expect(grantableStaffRoles('admin')).toEqual(['sales', 'delivery']);
    expect(grantableStaffRoles('sales')).toEqual([]);
    expect(grantableStaffRoles('superadmin')).toContain('superadmin');
    expect(CLIENT_ASSIGNABLE_ROLES).not.toContain('client_owner');
  });
  it('limits client roles', () => {
    expect(memberCan('read_only', 'tickets:create')).toBe(false);
    expect(memberCan('client_member', 'team:manage')).toBe(false);
    expect(memberCan('client_owner', 'team:manage')).toBe(true);
  });
});

describe('CSV export safety', () => {
  it('neutralizes formulas and quotes', () => {
    expect(csvCell('=HYPERLINK("x")')).toBe(`"'=HYPERLINK(""x"")"`);
    expect(csvCell('+1 555')).toBe("'+1 555");
    expect(csvCell('plain')).toBe('plain');
    expect(csvCell('a,b')).toBe('"a,b"');
    expect(csvCell(null)).toBe('');
  });
});

describe('markdown renderer', () => {
  const html = (md: string) => renderToStaticMarkup(createElement(Fragment, null, ...renderMarkdown(md)));
  it('never emits raw HTML or javascript: links', () => {
    const out = html('## Title\n\nHello <script>alert(1)</script> [x](javascript:alert(1)) [ok](/contact)');
    expect(out).not.toContain('<script>');
    expect(out).toContain('&lt;script&gt;');
    expect(out).not.toContain('javascript:');
    expect(out).toContain('href="/contact"');
    expect(out).toContain('<h2 id="title">Title</h2>');
  });
  it('renders lists and emphasis', () => {
    const out = html('- **one**\n- *two*\n\n1. first');
    expect(out).toContain('<ul><li><strong>one</strong></li><li><em>two</em></li></ul>');
    expect(out).toContain('<ol><li>first</li></ol>');
  });
});

describe('AWS SigV4 presigning', () => {
  it('matches the AWS documentation test vector', () => {
    const url = presignUrl({
      method: 'GET',
      endpoint: 'https://s3.amazonaws.com',
      region: 'us-east-1',
      bucket: 'examplebucket',
      key: 'test.txt',
      accessKeyId: 'AKIAIOSFODNN7EXAMPLE',
      secretAccessKey: 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY',
      expiresSeconds: 86400,
      forcePathStyle: false,
      now: new Date('2013-05-24T00:00:00Z'),
    });
    expect(url).toContain('https://examplebucket.s3.amazonaws.com/test.txt?');
    expect(url).toContain('X-Amz-Signature=aeeed9bbccd4d02ee5c0109b86d86835f995330da4c265957d157751f604d404');
  });
});

describe('upload validation', () => {
  const file = (name: string, bytes: number[] | string) =>
    new File([typeof bytes === 'string' ? bytes : new Uint8Array(bytes)], name);
  it('accepts real PDFs and rejects disguised or disallowed files', async () => {
    expect((await validateUpload(file('a.pdf', '%PDF-1.7 test'))).ok).toBe(true);
    expect((await validateUpload(file('a.pdf', 'MZ fake exe'))).ok).toBe(false);
    expect((await validateUpload(file('a.html', '<html></html>'))).ok).toBe(false);
    expect((await validateUpload(file('a.svg', '<svg/>'))).ok).toBe(false);
    expect(
      (await validateUpload(file('a.png', [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0]))).ok,
    ).toBe(true);
    expect((await validateUpload(file('a.txt', [104, 105, 0, 1]))).ok).toBe(false);
  });
  it('enforces the size limit', async () => {
    const big = new File([new Uint8Array(4 * 1024 * 1024 + 1)], 'big.pdf');
    expect((await validateUpload(big)).ok).toBe(false);
  });
  it('sanitizes names', () => {
    expect(sanitizeFileName('../../etc/passwd')).toBe('passwd');
    expect(sanitizeFileName('my <file>.pdf')).toBe('my _file_.pdf');
  });
});

describe('helpers', () => {
  it('parses Central-time inputs', () => {
    const d = parseBusinessDate('2026-11-09T09:30')!;
    expect(d.toISOString()).toBe('2026-11-09T15:30:00.000Z'); // CST = UTC-6
    expect(toBusinessInput(d)).toBe('2026-11-09T09:30');
    expect(parseBusinessDate('2026-07-01T09:00')!.toISOString()).toBe('2026-07-01T14:00:00.000Z'); // CDT
    expect(parseBusinessDate('nope')).toBeNull();
  });
  it('dedupes company identity sensibly', () => {
    expect(normalizeCompanyName('Acme Roofing, LLC')).toBe('acme roofing');
    expect(domainFromEmail('jo@gmail.com')).toBeNull();
    expect(domainFromEmail('jo@AcmeRoofing.com')).toBe('acmeroofing.com');
  });
  it('redacts PII in logs', () => {
    expect(redact({ email: 'a@b.com', nested: { phone: '1', id: 'x' } })).toEqual({
      email: '[redacted]',
      nested: { phone: '[redacted]', id: 'x' },
    });
  });
  it('logs the cause of a failed query without its parameters', () => {
    const cause = Object.assign(new Error('password authentication failed for user "postgres"'), {
      code: '28P01',
    });
    const err = new Error('Failed query: select * from users where email = $1\nparams: jo@acme.com', {
      cause,
    });
    expect(redact({ err })).toEqual({
      err: {
        name: 'Error',
        message: 'Failed query: select * from users where email = $1',
        cause: {
          name: 'Error',
          message: 'password authentication failed for user "postgres"',
          code: '28P01',
        },
      },
    });
  });
  it('computes proposal deposit and balance', () => {
    expect(
      proposalTotals(
        [
          { quantity: 1, unitPriceCents: 250000 },
          { quantity: 2, unitPriceCents: 1000 },
        ],
        50,
      ),
    ).toEqual({ total: 252000, deposit: 126000, balance: 126000 });
  });
});
