import 'server-only';
import { env, isEmailConfigured } from './env';
import { log } from './logger';

export type EmailResult = { status: 'sent' | 'not_configured' | 'failed'; id?: string };

/**
 * Transactional email through Resend's REST API. Without credentials this
 * returns `not_configured` (and the UI says so) instead of pretending to send.
 */
export async function sendEmail(input: {
  to: string[];
  subject: string;
  text: string;
  replyTo?: string;
}): Promise<EmailResult> {
  if (!isEmailConfigured()) return { status: 'not_configured' };
  if (input.to.length === 0) return { status: 'not_configured' };
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${env().RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: env().EMAIL_FROM,
        to: input.to,
        subject: input.subject,
        text: input.text,
        ...(input.replyTo ? { reply_to: input.replyTo } : {}),
      }),
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) {
      log.error('email.send_failed', { status: res.status });
      return { status: 'failed' };
    }
    const json = (await res.json().catch(() => ({}))) as { id?: string };
    return { status: 'sent', id: json.id };
  } catch (err) {
    log.error('email.send_error', { err });
    return { status: 'failed' };
  }
}
