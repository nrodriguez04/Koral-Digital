import type { Metadata } from 'next';
import { services } from '@/content/services';
import type { SiteSettings } from './settings-schema';

export const SITE_NAME = 'Koral Digital';
export const OG_IMAGE = '/brand/og-image-1200x630.jpg';

export function pageMetadata({
  title,
  description,
  path,
  noindex,
  type = 'website',
  publishedTime,
  modifiedTime,
}: {
  title: string;
  description: string;
  path: string;
  noindex?: boolean;
  type?: 'website' | 'article';
  publishedTime?: string;
  modifiedTime?: string;
}): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title,
      description,
      url: path,
      siteName: SITE_NAME,
      locale: 'en_US',
      type,
      images: [
        { url: OG_IMAGE, width: 1200, height: 630, alt: 'Koral Digital — Building a better tomorrow' },
      ],
      ...(type === 'article' ? { publishedTime, modifiedTime } : {}),
    },
    twitter: { card: 'summary_large_image', title, description, images: [OG_IMAGE] },
    ...(noindex ? { robots: { index: false, follow: false } } : {}),
  };
}

/** Safely serializes JSON-LD (escapes `<` to prevent script injection). */
export function JsonLd({ data }: { data: Record<string, unknown> | Record<string, unknown>[] }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }}
    />
  );
}

/**
 * Organization + ProfessionalService. Only verifiable facts: name, URL, logo,
 * headquarters city/region, a worldwide service area and the service catalog.
 * No street address, hours, ratings or prices.
 * Email/phone are included only when an admin has verified them.
 */
export function organizationJsonLd(base: string, s: SiteSettings) {
  const contactPoint =
    s.contactEmailVerified || (s.phoneVerified && s.phone)
      ? [
          {
            '@type': 'ContactPoint',
            contactType: 'sales',
            areaServed: 'Worldwide',
            availableLanguage: ['English'],
            ...(s.contactEmailVerified ? { email: s.contactEmail } : {}),
            ...(s.phoneVerified && s.phone ? { telephone: s.phone } : {}),
          },
        ]
      : undefined;
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': `${base}/#organization`,
        name: s.businessName,
        url: base,
        logo: {
          '@type': 'ImageObject',
          url: `${base}/brand/koral-mark-light.png`,
          width: 1024,
          height: 1024,
        },
        slogan: s.tagline,
        description: s.seo.defaultDescription,
        ...(s.founderName ? { founder: { '@type': 'Person', name: s.founderName } } : {}),
        ...(s.linkedinUrl ? { sameAs: [s.linkedinUrl] } : {}),
        ...(contactPoint ? { contactPoint } : {}),
      },
      {
        '@type': 'ProfessionalService',
        '@id': `${base}/#business`,
        name: s.businessName,
        url: base,
        image: `${base}/brand/og-image-1200x630.jpg`,
        parentOrganization: { '@id': `${base}/#organization` },
        address: {
          '@type': 'PostalAddress',
          addressLocality: s.city,
          addressRegion: s.region,
          addressCountry: 'US',
        },
        description: s.seo.defaultDescription,
        areaServed: 'Worldwide',
        hasOfferCatalog: {
          '@type': 'OfferCatalog',
          name: 'Services',
          itemListElement: services.map((svc) => ({
            '@type': 'Offer',
            itemOffered: {
              '@type': 'Service',
              name: svc.name,
              description: svc.metaDescription,
              url: `${base}/services/${svc.slug}`,
            },
          })),
        },
        knowsAbout: [
          'CRM implementation',
          'Lead response automation',
          'Missed-call recovery',
          'Estimate follow-up',
          'Workflow automation',
          'Revenue attribution reporting',
          'Home-service business operations',
        ],
        ...(s.contactEmailVerified ? { email: s.contactEmail } : {}),
        ...(s.phoneVerified && s.phone ? { telephone: s.phone } : {}),
      },
      {
        '@type': 'WebSite',
        '@id': `${base}/#website`,
        url: base,
        name: s.businessName,
        publisher: { '@id': `${base}/#organization` },
      },
    ],
  };
}

export function breadcrumbJsonLd(base: string, items: { name: string; path: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: it.name,
      item: `${base}${it.path}`,
    })),
  };
}

export function serviceJsonLd(base: string, s: { name: string; description: string; path: string }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: s.name,
    description: s.description,
    url: `${base}${s.path}`,
    serviceType: s.name,
    provider: { '@id': `${base}/#organization` },
    areaServed: 'Worldwide',
    audience: { '@type': 'BusinessAudience', audienceType: 'Home-service and construction businesses' },
  };
}

/** Use only where the same Q&A are visibly rendered on the page. */
export function faqJsonLd(faqs: { q: string; a: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };
}

export function articleJsonLd(
  base: string,
  a: {
    title: string;
    description: string;
    slug: string;
    authorName: string;
    publishedAt: Date;
    updatedAt: Date;
  },
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: a.title,
    description: a.description,
    mainEntityOfPage: `${base}/insights/${a.slug}`,
    datePublished: a.publishedAt.toISOString(),
    dateModified: a.updatedAt.toISOString(),
    author: { '@type': 'Person', name: a.authorName },
    publisher: { '@id': `${base}/#organization` },
    image: `${base}${OG_IMAGE}`,
  };
}
