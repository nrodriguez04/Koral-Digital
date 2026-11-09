import type { Metadata, Viewport } from 'next';
import localFont from 'next/font/local';
import type { ReactNode } from 'react';
import { env, isIndexingAllowed, siteUrl } from '@/lib/env';
import { getSiteSettings } from '@/lib/settings';
import { OG_IMAGE, SITE_NAME } from '@/lib/seo';
import './globals.css';

const inter = localFont({
  src: './fonts/inter-latin-wght.woff2',
  variable: '--font-inter',
  display: 'swap',
  weight: '100 900',
});

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSiteSettings();
  const verification = process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION;
  const bing = process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION;
  return {
    metadataBase: new URL(siteUrl()),
    title: { default: s.seo.defaultTitle, template: `%s | ${SITE_NAME}` },
    description: s.seo.defaultDescription,
    applicationName: SITE_NAME,
    authors: [{ name: s.businessName }],
    creator: s.businessName,
    icons: {
      icon: [
        { url: '/favicon.ico', sizes: 'any' },
        { url: '/brand/icon-192.png', type: 'image/png', sizes: '192x192' },
      ],
      apple: [{ url: '/brand/icon-192.png', sizes: '192x192' }],
    },
    openGraph: {
      siteName: SITE_NAME,
      type: 'website',
      locale: 'en_US',
      images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: 'Koral Digital — Building a better tomorrow' }],
    },
    twitter: { card: 'summary_large_image' },
    robots: isIndexingAllowed() ? { index: true, follow: true } : { index: false, follow: false },
    verification: {
      ...(verification ? { google: verification } : {}),
      ...(bing ? { other: { 'msvalidate.01': bing } } : {}),
    },
    other: env().VERCEL_ENV === 'preview' ? { 'x-deployment': 'preview' } : {},
  };
}

export const viewport: Viewport = {
  themeColor: '#082E46',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en-US" className={inter.variable}>
      <body className="min-h-dvh font-sans">{children}</body>
    </html>
  );
}
