import { legalLastUpdated, privacySections } from '@/content/legal';
import { LegalDocument } from '@/components/marketing/legal-document';
import { pageMetadata } from '@/lib/seo';

export const metadata = pageMetadata({
  title: 'Privacy notice',
  description: 'How Koral Digital collects, uses and protects information submitted through koraldigital.com and the client portal.',
  path: '/privacy',
});

export default function PrivacyPage() {
  return <LegalDocument title="Privacy notice" updated={legalLastUpdated} sections={privacySections} />;
}
