import 'server-only';
import { z } from 'zod';

/**
 * Server environment, validated once. Every integration is optional so the
 * public site always builds; features that need a missing credential report
 * "not configured" and fail closed instead of pretending to work.
 */
const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  NEXT_PUBLIC_SITE_URL: z.string().url().default('https://koraldigital.com'),
  DATABASE_URL: z.string().optional(),
  APP_SECRET: z.string().min(32).optional(),

  NEXT_PUBLIC_DESCOPE_PROJECT_ID: z.string().optional(),
  NEXT_PUBLIC_DESCOPE_BASE_URL: z.string().url().optional(),
  NEXT_PUBLIC_DESCOPE_SIGN_IN_FLOW_ID: z.string().default('sign-in'),
  DESCOPE_MANAGEMENT_KEY: z.string().optional(),
  SETUP_TOKEN: z.string().min(24).optional(),
  AUTH_DEV_MOCK: z.string().optional(),

  RESEND_API_KEY: z.string().optional(),
  EMAIL_FROM: z.string().optional(),
  LEAD_NOTIFICATION_EMAILS: z.string().optional(),

  STORAGE_DRIVER: z.enum(['s3', 'local', 'none']).default('none'),
  S3_ENDPOINT: z.string().url().optional(),
  S3_REGION: z.string().default('us-east-1'),
  S3_BUCKET: z.string().optional(),
  S3_ACCESS_KEY_ID: z.string().optional(),
  S3_SECRET_ACCESS_KEY: z.string().optional(),
  S3_FORCE_PATH_STYLE: z.string().optional(),

  VERCEL_ENV: z.enum(['production', 'preview', 'development']).optional(),
  SITE_INDEXING: z.enum(['auto', 'on', 'off']).default('auto'),
});

export type ServerEnv = z.infer<typeof schema>;

let cached: ServerEnv | null = null;

export function env(): ServerEnv {
  if (cached) return cached;
  const parsed = schema.safeParse(
    Object.fromEntries(Object.entries(process.env).map(([k, v]) => [k, v === '' ? undefined : v])),
  );
  if (!parsed.success) {
    const issues = parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; ');
    throw new Error(`Invalid environment configuration: ${issues}`);
  }
  cached = parsed.data;
  return cached;
}

export const isProduction = () => env().NODE_ENV === 'production';

/** Descope is usable only with a project ID. */
export const isDescopeConfigured = () => Boolean(env().NEXT_PUBLIC_DESCOPE_PROJECT_ID);

/**
 * Local auth mock: development/test ONLY. Hard-disabled for production builds
 * regardless of the flag, so it can never become a production bypass.
 */
export const isDevAuthMockEnabled = () =>
  env().NODE_ENV !== 'production' && env().VERCEL_ENV === undefined && env().AUTH_DEV_MOCK === 'true';

export const isEmailConfigured = () => Boolean(env().RESEND_API_KEY && env().EMAIL_FROM);

/** Public pages are indexable only on the production deployment. */
export function isIndexingAllowed(): boolean {
  const e = env();
  if (e.SITE_INDEXING === 'on') return true;
  if (e.SITE_INDEXING === 'off') return false;
  if (e.VERCEL_ENV) return e.VERCEL_ENV === 'production';
  return e.NODE_ENV === 'production';
}

export function appSecret(): string {
  const secret = env().APP_SECRET;
  if (secret) return secret;
  if (isProduction()) throw new Error('APP_SECRET must be set (32+ characters) in production.');
  return 'development-only-insecure-secret-do-not-use';
}

export const siteUrl = () => env().NEXT_PUBLIC_SITE_URL.replace(/\/$/, '');
