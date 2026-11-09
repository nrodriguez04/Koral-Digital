import Link from 'next/link';
import { Logo } from '@/components/marketing/logo';
import { ButtonLink } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-6 py-16 text-center">
      <Logo />
      <p className="eyebrow mt-12">404</p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">We could not find that page.</h1>
      <p className="mt-3 max-w-md text-ink/65">The link may be out of date, or the page may have moved.</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <ButtonLink href="/">Go to the homepage</ButtonLink>
        <ButtonLink href="/contact" variant="outline">
          Contact us
        </ButtonLink>
      </div>
      <nav aria-label="Popular pages" className="mt-10 flex flex-wrap justify-center gap-4 text-sm text-ocean-700">
        <Link href="/services">Services</Link>
        <Link href="/industries">Industries</Link>
        <Link href="/about">About</Link>
        <Link href="/koral-initiative">Koral Initiative</Link>
      </nav>
    </div>
  );
}
