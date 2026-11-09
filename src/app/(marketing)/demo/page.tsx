import { PageHero } from '@/components/marketing/sections';
import { LeadFlowDemo } from '@/components/marketing/lead-flow-demo';
import { pageMetadata } from '@/lib/seo';

export const metadata = pageMetadata({
  title: 'Example Lead-to-Booked workflow (synthetic demo)',
  description:
    'A step-by-step, synthetic demonstration of how a Lead-to-Booked workflow handles a new inquiry.',
  path: '/demo',
  noindex: true,
});

export default function DemoPage() {
  return (
    <>
      <PageHero
        eyebrow="Interactive demo"
        title="Follow one inquiry through a Lead-to-Booked workflow."
        intro="This walkthrough uses invented, synthetic data to show what each step looks like for your team. It is an illustration of the approach — not a client result and not real customer information."
      />
      <section className="container-page py-14">
        <LeadFlowDemo />
      </section>
    </>
  );
}
