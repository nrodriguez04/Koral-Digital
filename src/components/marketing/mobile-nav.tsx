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
        className="inline-flex size-10 items-center justify-center rounded-xl text-ink hover:bg-ink/5"
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
        className="m-0 ml-auto h-dvh max-h-dvh w-full max-w-sm bg-ivory p-0 backdrop:bg-ink/40"
      >
        <div className="flex h-full flex-col">
          <div className="flex h-16 items-center justify-between border-b border-ink/8 px-4">
            <span className="text-sm font-semibold tracking-[0.2em]">MENU</span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="inline-flex size-10 items-center justify-center rounded-xl hover:bg-ink/5"
              aria-label="Close menu"
            >
              <X className="size-5" aria-hidden="true" />
            </button>
          </div>
          <nav aria-label="Mobile" className="flex-1 overflow-y-auto px-4 py-4">
            <p className="eyebrow mb-2">Services</p>
            <ul className="mb-6 space-y-1">
              <li>
                <Link href="/services" className="block rounded-lg px-3 py-2 font-medium hover:bg-ink/5">
                  All services
                </Link>
              </li>
              {services.map((s) => (
                <li key={s.href}>
                  <Link href={s.href} className="block rounded-lg px-3 py-2 text-ink/80 hover:bg-ink/5">
                    {s.label}
                  </Link>
                </li>
              ))}
            </ul>
            <p className="eyebrow mb-2">Company</p>
            <ul className="space-y-1">
              {primaryNav.slice(1).map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="block rounded-lg px-3 py-2 font-medium hover:bg-ink/5">
                    {item.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/contact" className="block rounded-lg px-3 py-2 font-medium hover:bg-ink/5">
                  Contact
                </Link>
              </li>
            </ul>
          </nav>
          <div className="border-t border-ink/8 p-4">
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
