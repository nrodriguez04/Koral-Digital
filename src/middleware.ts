import { NextResponse, type NextRequest } from 'next/server';

/**
 * A fast pre-check only: every private page, server action and route handler
 * re-validates the session and enforces roles/tenancy server-side against the
 * database.
 *
 * This stays `middleware.ts` rather than Next 16's `proxy.ts` on purpose. A
 * proxy always compiles to the Node.js runtime, which the Cloudflare adapter
 * supports only experimentally and bundles at about 4 MB. Middleware compiles
 * to the Edge runtime, which it bundles in a few hundred KB, and this handler
 * only reads cookies.
 */
const PRIVATE_PREFIXES = ['/app', '/portal'];

export function middleware(req: NextRequest) {
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
