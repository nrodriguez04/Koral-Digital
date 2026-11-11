import Link from 'next/link';
import { services } from '@/content/services';
import { ButtonLink } from '@/components/ui/button';
import { Logo } from './logo';
import { MobileNav } from './mobile-nav';
import { primaryNav } from './nav-data';

export function SiteHeader() {
  const serviceLinks = services.map((s) => ({
    href: `/services/${s.slug}`,
    label: s.shortName,
    summary: s.tagline,
  }));
  return (
    <header className="border-ink/8 bg-ivory/90 supports-[backdrop-filter]:bg-ivory/75 sticky top-0 z-40 border-b backdrop-blur">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:rounded-lg focus:bg-white focus:px-3 focus:py-2 focus:text-sm focus:shadow"
      >
        Skip to content
      </a>
      <div className="container-page flex h-16 items-center justify-between gap-4 sm:h-[72px]">
        <Logo />
        <nav aria-label="Primary" className="hidden items-center gap-1 lg:flex">
          <div className="group relative">
            <Link
              href="/services"
              className="text-ink/80 hover:bg-ink/5 hover:text-ink rounded-lg px-3 py-2 text-sm font-medium transition"
            >
              Services
            </Link>
            <div className="invisible absolute top-full left-1/2 w-[640px] -translate-x-1/2 pt-2 opacity-0 transition group-focus-within:visible group-focus-within:opacity-100 group-hover:visible group-hover:opacity-100">
              <div className="card grid grid-cols-2 gap-1 p-2">
                {serviceLinks.map((s) => (
                  <Link key={s.href} href={s.href} className="hover:bg-ocean-50 rounded-xl p-3 transition">
                    <span className="text-ink block text-sm font-semibold">{s.label}</span>
                    <span className="text-ink/60 mt-0.5 line-clamp-2 block text-xs">{s.summary}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
          {primaryNav.slice(1).map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-ink/80 hover:bg-ink/5 hover:text-ink rounded-lg px-3 py-2 text-sm font-medium transition"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <ButtonLink
            href="/contact"
            size="md"
            className="hidden sm:inline-flex"
            data-track="cta_click"
            data-track-label="header_consultation"
          >
            Book a free consultation
          </ButtonLink>
          <MobileNav services={serviceLinks} />
        </div>
      </div>
    </header>
  );
}
