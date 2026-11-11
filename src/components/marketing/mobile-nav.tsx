'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { Menu, X } from 'lucide-react';
import { buttonClasses } from '@/components/ui/button';
import { primaryNav } from './nav-data';

export function MobileNav({ services }: { services: { href: string; label: string }[] }) {
  const pathname = usePathname();
  // The menu is open only for the path it was opened on, so navigating closes it.
  const [openOn, setOpenOn] = useState<string | null>(null);
  const open = openOn === pathname;
  const setOpen = (v: boolean) => setOpenOn(v ? pathname : null);
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const d = dialogRef.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  return (
    <div className="lg:hidden">
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-ink hover:bg-ink/5 inline-flex size-10 items-center justify-center rounded-xl"
        aria-label="Open menu"
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        <Menu className="size-5" aria-hidden="true" />
      </button>
      <dialog
        ref={dialogRef}
        onClose={() => setOpen(false)}
        aria-label="Site menu"
        className="bg-ivory backdrop:bg-ink/40 m-0 ml-auto h-dvh max-h-dvh w-full max-w-sm p-0"
      >
        <div className="flex h-full flex-col">
          <div className="border-ink/8 flex h-16 items-center justify-between border-b px-4">
            <span className="text-sm font-semibold tracking-[0.2em]">MENU</span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="hover:bg-ink/5 inline-flex size-10 items-center justify-center rounded-xl"
              aria-label="Close menu"
            >
              <X className="size-5" aria-hidden="true" />
            </button>
          </div>
          <nav aria-label="Mobile" className="flex-1 overflow-y-auto px-4 py-4">
            <p className="eyebrow mb-2">Services</p>
            <ul className="mb-6 space-y-1">
              <li>
                <Link href="/services" className="hover:bg-ink/5 block rounded-lg px-3 py-2 font-medium">
                  All services
                </Link>
              </li>
              {services.map((s) => (
                <li key={s.href}>
                  <Link href={s.href} className="text-ink/80 hover:bg-ink/5 block rounded-lg px-3 py-2">
                    {s.label}
                  </Link>
                </li>
              ))}
            </ul>
            <p className="eyebrow mb-2">Company</p>
            <ul className="space-y-1">
              {primaryNav.slice(1).map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="hover:bg-ink/5 block rounded-lg px-3 py-2 font-medium">
                    {item.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/contact" className="hover:bg-ink/5 block rounded-lg px-3 py-2 font-medium">
                  Contact
                </Link>
              </li>
            </ul>
          </nav>
          <div className="border-ink/8 border-t p-4">
            <Link
              href="/contact"
              className={buttonClasses({ size: 'lg', className: 'w-full' })}
              data-track="cta_click"
              data-track-label="mobile_menu_consultation"
            >
              Book a free consultation
            </Link>
          </div>
        </div>
      </dialog>
    </div>
  );
}
