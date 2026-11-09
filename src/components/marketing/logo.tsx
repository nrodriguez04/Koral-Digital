import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export function Logo({
  inverse = false,
  href = '/',
  className,
}: {
  inverse?: boolean;
  href?: string;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={cn('group inline-flex items-center gap-2.5', className)}
      aria-label="Koral Digital home"
    >
      <Image
        src="/brand/koral-mark-trim.png"
        alt=""
        width={40}
        height={40}
        priority
        className="size-9 sm:size-10"
      />
      <span className="flex flex-col leading-none">
        <span
          className={cn(
            'text-[15px] font-semibold tracking-[0.22em] sm:text-base',
            inverse ? 'text-white' : 'text-ink',
          )}
        >
          KORAL DIGITAL
        </span>
        <span
          className={cn(
            'mt-1 hidden text-[11px] tracking-wide sm:block',
            inverse ? 'text-ocean-300' : 'text-ocean-600',
          )}
        >
          Building a better tomorrow
        </span>
      </span>
    </Link>
  );
}
