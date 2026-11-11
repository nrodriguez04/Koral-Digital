'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Menu, X } from 'lucide-react';

export function MobileSidebar({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [openOn, setOpenOn] = useState<string | null>(null);
  const open = openOn === pathname;
  const setOpen = (v: boolean) => setOpenOn(v ? pathname : null);
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="hover:bg-ink/5 inline-flex size-9 items-center justify-center rounded-lg"
        aria-label="Open navigation"
      >
        <Menu className="size-5" aria-hidden="true" />
      </button>
      <dialog
        ref={ref}
        onClose={() => setOpen(false)}
        className="bg-ocean-950 backdrop:bg-ink/50 m-0 h-dvh max-h-dvh w-72 max-w-[85vw] p-0"
        aria-label="Navigation"
      >
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="absolute top-4 right-3 inline-flex size-8 items-center justify-center rounded-lg text-white/70 hover:bg-white/10"
          aria-label="Close navigation"
        >
          <X className="size-4" aria-hidden="true" />
        </button>
        {children}
      </dialog>
    </>
  );
}
