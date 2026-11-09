import 'server-only';

type Level = 'debug' | 'info' | 'warn' | 'error';

const REDACT_KEYS = /(email|phone|name|message|password|token|secret|authorization|cookie|body|address)/i;

/** Recursively redacts values whose key looks like PII or a secret. */
export function redact(value: unknown, depth = 0): unknown {
  if (depth > 4) return '[depth]';
  if (Array.isArray(value)) return value.map((v) => redact(v, depth + 1));
  if (value && typeof value === 'object') {
    if (value instanceof Error) return { name: value.name, message: value.message };
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([k, v]) => [
        k,
        REDACT_KEYS.test(k) ? '[redacted]' : redact(v, depth + 1),
      ]),
    );
  }
  return value;
}

function write(level: Level, event: string, data?: Record<string, unknown>) {
  if (level === 'debug' && process.env.NODE_ENV === 'production') return;
  const line = JSON.stringify({ ts: new Date().toISOString(), level, event, ...(redact(data ?? {}) as object) });
  if (level === 'error') console.error(line);
  else if (level === 'warn') console.warn(line);
  else console.log(line);
}

export const log = {
  debug: (event: string, data?: Record<string, unknown>) => write('debug', event, data),
  info: (event: string, data?: Record<string, unknown>) => write('info', event, data),
  warn: (event: string, data?: Record<string, unknown>) => write('warn', event, data),
  error: (event: string, data?: Record<string, unknown>) => write('error', event, data),
};
