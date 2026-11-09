import { legalLastUpdated, termsSections } from '@/content/legal';
import { LegalDocument } from '@/components/marketing/legal-document';
import { pageMetadata } from '@/lib/seo';

export const metadata = pageMetadata({
  title: 'Terms of use',
  description: 'Terms governing use of the Koral Digital website and client portal.',
  path: '/terms',
});

export default function TermsPage() {
  return <LegalDocument title="Terms of use" updated={legalLastUpdated} sections={termsSections} />;
}
