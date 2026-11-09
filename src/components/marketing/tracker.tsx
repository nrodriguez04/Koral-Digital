'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

/**
 * First-party, cookieless analytics. Sends only: event name, path, a random
 * per-tab session id, UTM parameters and referrer host. Respects Global
 * Privacy Control and Do Not Track by sending nothing.
 */
const ATTR_KEY = 'kd_attr';
const SID_KEY = 'kd_sid';

export type Attribution = {
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmTerm?: string;
  utmContent?: string;
  referrer?: string;
  landingPath?: string;
};

function optedOut() {
  if (typeof navigator === 'undefined') return true;
  const nav = navigator as Navigator & { globalPrivacyControl?: boolean };
  return nav.globalPrivacyControl === true || navigator.doNotTrack === '1';
}

function storage(): Storage | null {
  try {
    return window.sessionStorage;
  } catch {
    return null;
  }
}

function sessionId() {
  const s = storage();
  let id = s?.getItem(SID_KEY);
  if (!id) {
    id = Math.random().toString(36).slice(2) + Date.now().toString(36);
    s?.setItem(SID_KEY, id);
  }
  return id;
}

export function getAttribution(): Attribution {
  try {
    return JSON.parse(storage()?.getItem(ATTR_KEY) ?? '{}') as Attribution;
  } catch {
    return {};
  }
}

export function track(name: string, props: Record<string, string> = {}) {
  if (optedOut()) return;
  const attr = getAttribution();
  const payload = JSON.stringify({
    name,
    path: window.location.pathname,
    sessionId: sessionId(),
    utmSource: attr.utmSource,
    utmMedium: attr.utmMedium,
    utmCampaign: attr.utmCampaign,
    referrer: attr.referrer,
    props,
  });
  try {
    if (navigator.sendBeacon) {
      navigator.sendBeacon('/api/events', new Blob([payload], { type: 'application/json' }));
    } else {
      void fetch('/api/events', { method: 'POST', body: payload, keepalive: true, headers: { 'content-type': 'application/json' } });
    }
  } catch {
    /* analytics must never break the page */
  }
}

export function Tracker() {
  const pathname = usePathname();
  const params = useSearchParams();

  // Capture first-touch attribution for this browsing session.
  useEffect(() => {
    const s = storage();
    if (!s || s.getItem(ATTR_KEY)) return;
    const get = (k: string) => params.get(k) ?? undefined;
    let referrer: string | undefined;
    try {
      referrer = document.referrer && new URL(document.referrer).host !== window.location.host ? document.referrer : undefined;
    } catch {
      referrer = undefined;
    }
    const attr: Attribution = {
      utmSource: get('utm_source'),
      utmMedium: get('utm_medium'),
      utmCampaign: get('utm_campaign'),
      utmTerm: get('utm_term'),
      utmContent: get('utm_content'),
      referrer,
      landingPath: window.location.pathname,
    };
    s.setItem(ATTR_KEY, JSON.stringify(attr));
  }, [params]);

  useEffect(() => {
    track('page_view');
  }, [pathname]);

  // Delegate clicks on [data-track] elements.
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const el = (e.target as HTMLElement | null)?.closest<HTMLElement>('[data-track]');
      if (!el) return;
      track(el.dataset.track!, el.dataset.trackLabel ? { label: el.dataset.trackLabel } : {});
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, []);

  return null;
}
