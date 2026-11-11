import Link from 'next/link';
import { services } from '@/content/services';
import { industries } from '@/content/industries';
import type { SiteSettings } from '@/lib/settings-schema';
import { Logo } from './logo';

export function SiteFooter({ settings }: { settings: SiteSettings }) {
  const year = new Date().getFullYear();
  return (
    <footer className="ocean-gradient text-white">
      <div className="container-page grid gap-10 py-14 md:grid-cols-12">
        <div className="md:col-span-4">
          <Logo inverse />
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/70">
            Founder-led operations, automation and systems-integration partner for home-service businesses.
            Remote-first, working with clients worldwide from our base in {settings.city}, {settings.region}.
          </p>
          {settings.contactEmailVerified ? (
            <p className="mt-4 text-sm">
              <a
                href={`mailto:${settings.contactEmail}`}
                className="text-ocean-300 underline-offset-2 hover:underline"
              >
                {settings.contactEmail}
              </a>
            </p>
          ) : null}
          {settings.phoneVerified && settings.phone ? (
            <p className="mt-1 text-sm">
              <a
                href={`tel:${settings.phone.replace(/[^0-9+]/g, '')}`}
                className="text-ocean-300 hover:underline"
              >
                {settings.phone}
              </a>
            </p>
          ) : null}
        </div>
        <FooterCol
          title="Services"
          links={services.map((s) => ({ href: `/services/${s.slug}`, label: s.shortName }))}
        />
        <FooterCol
          title="Industries"
          links={[
            ...industries.map((i) => ({ href: `/industries/${i.slug}`, label: i.name })),
            { href: '/industries', label: 'All industries' },
          ]}
        />
        <FooterCol
          title="Company"
          links={[
            { href: '/about', label: 'About' },
            { href: '/koral-initiative', label: 'Koral Initiative' },
            { href: '/insights', label: 'Insights' },
            { href: '/demo', label: 'Example workflow demo' },
            { href: '/contact', label: 'Contact' },
            { href: '/book', label: 'Book a consultation' },
          ]}
        />
        <FooterCol
          title="Account"
          links={[
            { href: '/portal', label: 'Client portal sign in' },
            { href: '/privacy', label: 'Privacy' },
            { href: '/terms', label: 'Terms' },
          ]}
        />
      </div>
      <div className="border-t border-white/10">
        <div className="container-page flex flex-col gap-2 py-6 text-xs text-white/55 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {settings.businessName}. {settings.tagline}
          </p>
          <p>
            Koral Initiative: a planned reef-conservation giving program — progress will be published as it
            happens.
          </p>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: { href: string; label: string }[] }) {
  return (
    <div className="md:col-span-2">
      <p className="text-ocean-300 text-xs font-semibold tracking-[0.18em] uppercase">{title}</p>
      <ul className="mt-4 space-y-2.5 text-sm">
        {links.map((l) => (
          <li key={l.href}>
            <Link href={l.href} className="text-white/75 transition hover:text-white">
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
