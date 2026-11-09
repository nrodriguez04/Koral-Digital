import type { MetadataRoute } from 'next';
import { industries } from '@/content/industries';
import { services } from '@/content/services';
import { siteUrl } from '@/lib/env';
import { getPublishedArticles } from '@/server/articles';

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl();
  const now = new Date();
  const staticPaths: { path: string; priority: number; changeFrequency: 'weekly' | 'monthly' | 'yearly' }[] =
    [
      { path: '/', priority: 1, changeFrequency: 'weekly' },
      { path: '/services', priority: 0.9, changeFrequency: 'monthly' },
      { path: '/industries', priority: 0.8, changeFrequency: 'monthly' },
      { path: '/about', priority: 0.7, changeFrequency: 'monthly' },
      { path: '/koral-initiative', priority: 0.6, changeFrequency: 'monthly' },
      { path: '/contact', priority: 0.8, changeFrequency: 'yearly' },
      { path: '/book', priority: 0.6, changeFrequency: 'yearly' },
      { path: '/insights', priority: 0.6, changeFrequency: 'weekly' },
      { path: '/privacy', priority: 0.2, changeFrequency: 'yearly' },
      { path: '/terms', priority: 0.2, changeFrequency: 'yearly' },
    ];
  const articles = await getPublishedArticles();
  return [
    ...staticPaths.map((p) => ({
      url: `${base}${p.path}`,
      lastModified: now,
      changeFrequency: p.changeFrequency,
      priority: p.priority,
    })),
    ...services.map((s) => ({
      url: `${base}/services/${s.slug}`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: s.slug === 'lead-to-booked' ? 0.9 : 0.8,
    })),
    ...industries.map((i) => ({
      url: `${base}/industries/${i.slug}`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    })),
    ...articles.map((a) => ({
      url: `${base}/insights/${a.slug}`,
      lastModified: a.updatedAt,
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    })),
  ];
}
