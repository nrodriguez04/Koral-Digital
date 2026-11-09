import type { MetadataRoute } from 'next';
import { isIndexingAllowed, siteUrl } from '@/lib/env';

export default function robots(): MetadataRoute.Robots {
  const base = siteUrl();
  if (!isIndexingAllowed()) {
    // Preview / non-production deployments: keep everything out of search.
    return { rules: [{ userAgent: '*', disallow: '/' }] };
  }
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/app', '/portal', '/api/', '/sign-in', '/invite/', '/setup', '/no-access', '/dev-login', '/demo'],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
