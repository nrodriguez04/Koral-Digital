import { NextResponse, type NextRequest } from 'next/server';

/**
 * Next.js 16 proxy (formerly middleware). This is a fast pre-check only:
 * every private page, server action and route handler re-validates the
 * session and enforces roles/tenancy server-side against the database.
 */
const PRIVATE_PREFIXES = ['/app', '/portal'];

export function proxy(req: NextRequest) {
  const { pathname, search } = req.nextUrl;
  const isPrivate = PRIVATE_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));
  if (!isPrivate) return NextResponse.next();

  const hasDescope = Boolean(req.cookies.get('DS')?.value || req.cookies.get('DSR')?.value);
  const hasDev = process.env.NODE_ENV !== 'production' && Boolean(req.cookies.get('kd_dev_session')?.value);
  if (!hasDescope && !hasDev) {
    const url = req.nextUrl.clone();
    url.pathname = '/sign-in';
    url.search = `?next=${encodeURIComponent(pathname + search)}`;
    const res = NextResponse.redirect(url);
    res.headers.set('X-Robots-Tag', 'noindex, nofollow');
    return res;
  }
  const res = NextResponse.next();
  res.headers.set('X-Robots-Tag', 'noindex, nofollow');
  res.headers.set('Cache-Control', 'private, no-store');
  return res;
}

export const config = {
  matcher: ['/app/:path*', '/portal/:path*', '/app', '/portal'],
};
