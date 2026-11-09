import { CalendarCheck2 } from 'lucide-react';
import { InquiryForm } from '@/components/forms/inquiry-form';
import { PageHero } from '@/components/marketing/sections';
import { pageMetadata } from '@/lib/seo';
import { getSiteSettings } from '@/lib/settings';

export const revalidate = 300;

export const metadata = pageMetadata({
  title: 'Book a free consultation',
  description:
    'Schedule a free 30-minute workflow consultation with Koral Digital to review how leads move from inquiry to booked estimate in your home-service business.',
  path: '/book',
});

export default async function BookPage() {
  const s = await getSiteSettings();
  const verified = s.bookingUrlVerified && s.bookingUrl;
  return (
    <>
      <PageHero
        eyebrow="Book"
        title="Book a free 30-minute consultation."
        intro="We will walk through how inquiries reach your team, where they stall, and what is worth fixing first. Bring your questions — and your current tools, whatever they are."
      />
      <section className="container-page py-14">
        {verified ? (
          <div className="card overflow-hidden">
            <div className="flex items-center justify-between gap-4 border-b border-ink/8 px-5 py-3">
              <p className="flex items-center gap-2 text-sm font-medium">
                <CalendarCheck2 className="size-4 text-ocean-600" aria-hidden="true" /> Choose a time
              </p>
              <a
                href={s.bookingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-semibold text-ocean-700 hover:underline"
                data-track="booking_click"
                data-track-label="book_page_new_tab"
              >
                Open in a new tab
              </a>
            </div>
            <iframe
              src={`${s.bookingUrl}${s.bookingUrl.includes('?') ? '&' : '?'}hide_gdpr_banner=1`}
              title="Booking calendar"
              className="h-[760px] w-full border-0"
              loading="lazy"
            />
          </div>
        ) : (
          <div className="mx-auto max-w-3xl">
            <p className="mb-6 text-ink/70">
              Online scheduling is being set up. Send us a few details below and we will reply within one business day
              with times that work for you.
            </p>
            <InquiryForm />
          </div>
        )}
      </section>
    </>
  );
}
