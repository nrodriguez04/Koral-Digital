import { Suspense, type ReactNode } from 'react';
import { SiteFooter } from '@/components/marketing/site-footer';
import { SiteHeader } from '@/components/marketing/site-header';
import { Tracker } from '@/components/marketing/tracker';
import { getSiteSettings } from '@/lib/settings';

export default async function MarketingLayout({ children }: { children: ReactNode }) {
  const settings = await getSiteSettings();
  const plausible = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN;
  return (
    <>
      <SiteHeader />
      <main id="main">{children}</main>
      <SiteFooter settings={settings} />
      <Suspense fallback={null}>
        <Tracker />
      </Suspense>
      {plausible ? <script defer data-domain={plausible} src="https://plausible.io/js/script.js" /> : null}
    </>
  );
}
