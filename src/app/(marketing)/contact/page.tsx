import { CalendarCheck2, Clock, MapPin, ShieldCheck } from 'lucide-react';
import { services } from '@/content/services';
import { industries } from '@/content/industries';
import { InquiryForm } from '@/components/forms/inquiry-form';
import { PageHero } from '@/components/marketing/sections';
import { siteUrl } from '@/lib/env';
import { breadcrumbJsonLd, JsonLd, pageMetadata } from '@/lib/seo';
import { getSiteSettings } from '@/lib/settings';
import { INDUSTRIES } from '@/lib/validation';

export const revalidate = 300;

export const metadata = pageMetadata({
  title: 'Contact us · Book a free consultation',
  description:
    'Tell us how leads reach your home-service business today. A real person replies within one business day to set up a free 30-minute workflow consultation.',
  path: '/contact',
});

const industryMap: Record<string, (typeof INDUSTRIES)[number]> = {
  roofing: 'Roofing',
  'remodeling-construction': 'Remodeling / construction',
  'property-maintenance': 'Property maintenance',
  restoration: 'Restoration',
};

export default async function ContactPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const sp = await searchParams;
  const s = await getSiteSettings();
  const service = services.find((x) => x.slug === sp.service)?.slug;
  const industry = industries.find((x) => x.slug === sp.industry) ? industryMap[sp.industry!] : undefined;
  const bookingUrl = s.bookingUrlVerified && s.bookingUrl ? s.bookingUrl : null;
  const crumbs = [
    { name: 'Home', path: '/' },
    { name: 'Contact', path: '/contact' },
  ];
  return (
    <>
      <JsonLd data={breadcrumbJsonLd(siteUrl(), crumbs)} />
      <PageHero
        breadcrumbs={crumbs}
        eyebrow="Contact"
        title="Let’s find where your leads are slipping."
        intro="Tell us a little about your business. We will reply personally to set up a free 30-minute consultation — no obligation and no sales sequence."
      />
      <section className="container-page grid gap-10 py-14 lg:grid-cols-12">
        <div className="lg:col-span-8">
          <InquiryForm defaultService={service} defaultIndustry={industry} bookingUrl={bookingUrl} />
        </div>
        <aside className="space-y-5 lg:col-span-4">
          <div className="card p-6">
            <h2 className="font-semibold">What to expect</h2>
            <ul className="mt-4 space-y-4 text-sm text-ink/70">
              <li className="flex gap-3">
                <Clock className="mt-0.5 size-4 shrink-0 text-ocean-600" aria-hidden="true" />
                A personal reply within one business day.
              </li>
              <li className="flex gap-3">
                <CalendarCheck2 className="mt-0.5 size-4 shrink-0 text-ocean-600" aria-hidden="true" />
                A free 30-minute consultation by video or, in North DFW, in person.
              </li>
              <li className="flex gap-3">
                <ShieldCheck className="mt-0.5 size-4 shrink-0 text-ocean-600" aria-hidden="true" />
                No CRM? No problem. Many businesses we talk to run on spreadsheets and phones.
              </li>
              <li className="flex gap-3">
                <MapPin className="mt-0.5 size-4 shrink-0 text-ocean-600" aria-hidden="true" />
                Based in {s.city}, {s.region}. Serving {s.serviceAreas.slice(0, 5).join(', ')} and beyond.
              </li>
            </ul>
          </div>
          {bookingUrl ? (
            <div className="card p-6">
              <h2 className="font-semibold">Prefer to book directly?</h2>
              <p className="mt-2 text-sm text-ink/65">Pick a time that suits you on our booking calendar.</p>
              <a
                href="/book"
                className="mt-4 inline-flex text-sm font-semibold text-ocean-700 hover:text-ocean-600"
                data-track="booking_click"
                data-track-label="contact_sidebar"
              >
                Open the booking page →
              </a>
            </div>
          ) : null}
          {s.contactEmailVerified ? (
            <div className="card p-6">
              <h2 className="font-semibold">Email</h2>
              <a href={`mailto:${s.contactEmail}`} className="mt-2 block text-sm text-ocean-700 hover:underline">
                {s.contactEmail}
              </a>
            </div>
          ) : null}
        </aside>
      </section>
    </>
  );
}
