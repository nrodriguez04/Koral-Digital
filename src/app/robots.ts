import type { MetadataRoute } from 'next';
import { isIndexingAllowed, siteUrl } from '@/lib/env';

const PRIVATE_PATHS = [
  '/app',
  '/portal',
  '/api/',
  '/sign-in',
  '/invite/',
  '/setup',
  '/no-access',
  '/dev-login',
  '/demo',
];

/**
 * AI search and assistant crawlers, named so the welcome is deliberate rather
 * than inherited from `*`. Being readable by them is how Koral turns up when
 * someone asks an assistant who can fix their lead follow-up.
 */
const AI_CRAWLERS = [
  'GPTBot',
  'OAI-SearchBot',
  'ChatGPT-User',
  'ClaudeBot',
  'Claude-SearchBot',
  'Claude-User',
  'PerplexityBot',
  'Perplexity-User',
  'Google-Extended',
  'Applebot-Extended',
  'Amazonbot',
  'DuckAssistBot',
  'MistralAI-User',
  'meta-externalagent',
  'CCBot',
];

export default function robots(): MetadataRoute.Robots {
  const base = siteUrl();
  if (!isIndexingAllowed()) {
    // Preview / non-production deployments: keep everything out of search.
    return { rules: [{ userAgent: '*', disallow: '/' }] };
  }
  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: PRIVATE_PATHS },
      { userAgent: AI_CRAWLERS, allow: '/', disallow: PRIVATE_PATHS },
    ],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
