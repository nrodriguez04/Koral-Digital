export const BUSINESS_TZ = 'America/Chicago';

function tzOffsetMinutes(date: Date, timeZone = BUSINESS_TZ) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hourCycle: 'h23',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).formatToParts(date);
  const get = (t: string) => Number(parts.find((p) => p.type === t)?.value);
  const asUtc = Date.UTC(
    get('year'),
    get('month') - 1,
    get('day'),
    get('hour'),
    get('minute'),
    get('second'),
  );
  return (asUtc - date.getTime()) / 60000;
}

/** Parses a `datetime-local` ("YYYY-MM-DDTHH:mm") or `date` ("YYYY-MM-DD") value as business-local time. */
export function parseBusinessDate(value: string | null | undefined): Date | null {
  if (!value) return null;
  const m = /^(\d{4})-(\d{2})-(\d{2})(?:T(\d{2}):(\d{2}))?$/.exec(value.trim());
  if (!m) return null;
  const [, y, mo, d, h = '12', mi = '00'] = m;
  const guess = new Date(Date.UTC(+y!, +mo! - 1, +d!, +h, +mi));
  const offset = tzOffsetMinutes(guess);
  return new Date(guess.getTime() - offset * 60000);
}

/** Formats a Date for a `datetime-local` input in business time. */
export function toBusinessInput(date: Date | null | undefined, withTime = true): string {
  if (!date) return '';
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: BUSINESS_TZ,
    hourCycle: 'h23',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).formatToParts(date);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? '00';
  const d = `${get('year')}-${get('month')}-${get('day')}`;
  return withTime ? `${d}T${get('hour')}:${get('minute')}` : d;
}

export function daysAgo(days: number) {
  return new Date(Date.now() - days * 86_400_000);
}
