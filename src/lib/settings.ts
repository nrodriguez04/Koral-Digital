import 'server-only';
import { eq } from 'drizzle-orm';
import { cache } from 'react';
import { getDb, isDatabaseConfigured } from '@/db';
import { siteSettings } from '@/db/schema';
import { log } from './logger';
import { defaultSiteSettings, siteSettingsSchema, type SiteSettings } from './settings-schema';

export const SITE_SETTINGS_KEY = 'site';

/** Reads settings from the DB, falling back to defaults so public pages never break. */
export const getSiteSettings = cache(async (): Promise<SiteSettings> => {
  if (!isDatabaseConfigured()) return defaultSiteSettings;
  try {
    const row = await getDb().query.siteSettings.findFirst({
      where: eq(siteSettings.key, SITE_SETTINGS_KEY),
    });
    if (!row) return defaultSiteSettings;
    const parsed = siteSettingsSchema.safeParse(row.value);
    if (!parsed.success) {
      log.warn('settings.invalid_stored_value', { issues: parsed.error.issues.length });
      return defaultSiteSettings;
    }
    return parsed.data;
  } catch (err) {
    log.warn('settings.read_failed', { err });
    return defaultSiteSettings;
  }
});

export { defaultSiteSettings, type SiteSettings };
