/** Only allow same-site relative redirects into known areas (prevents open redirects). */
export function safeNext(next: string | null | undefined): string | null {
  if (!next) return null;
  if (!next.startsWith('/') || next.startsWith('//') || next.includes('\\')) return null;
  if (!/^\/(app|portal|invite|setup)(\/|$|\?)/.test(next)) return null;
  return next;
}
