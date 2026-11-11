import { execSync } from 'node:child_process';
import { chromium, type FullConfig } from '@playwright/test';
import postgres from 'postgres';

/**
 * Playwright starts the web server before this runs. We (1) recreate and seed
 * an isolated e2e database, then (2) pre-compile routes so the dev server's
 * on-demand compilation and HMR reloads do not race the tests.
 */
export default async function globalSetup(config: FullConfig) {
  const url = process.env.E2E_DATABASE_URL ?? 'postgres://postgres@127.0.0.1:5432/koral_e2e';
  const admin = postgres(url.replace(/\/[^/]+$/, '/postgres'), { max: 1, onnotice: () => {} });
  const name = url.split('/').pop()!;
  await admin.unsafe(`drop database if exists "${name}" with (force)`);
  await admin.unsafe(`create database "${name}"`);
  await admin.end();
  const env = { ...process.env, DATABASE_URL: url };
  execSync('npx tsx scripts/migrate.ts', { env, stdio: 'inherit' });
  execSync('npx tsx scripts/bootstrap.ts', { env, stdio: 'inherit' });
  execSync('npx tsx scripts/seed-dev.ts', { env, stdio: 'inherit' });

  const baseURL = config.projects[0]!.use.baseURL!;
  const browser = await chromium.launch(config.projects[0]!.use.launchOptions);
  const page = await browser.newPage({ baseURL });
  const visit = async (path: string) => {
    for (let i = 0; i < 3; i++) {
      try {
        await page.goto(path, { waitUntil: 'networkidle', timeout: 120_000 });
        return;
      } catch {
        /* retry while the dev server compiles */
      }
    }
  };
  const publicRoutes = [
    '/',
    '/services',
    '/services/lead-to-booked',
    '/industries',
    '/industries/roofing',
    '/about',
    '/koral-initiative',
    '/contact',
    '/book',
    '/insights',
    '/demo',
    '/privacy',
    '/terms',
    '/sign-in',
    '/dev-login',
    '/no-access',
    '/sitemap.xml',
    '/robots.txt',
    '/llms.txt',
    '/manifest.webmanifest',
    '/invite/not-a-real-token-but-long-enough-000000',
  ];
  for (const r of publicRoutes) await visit(r);
  const login = async (devKey: string) => {
    await page.context().clearCookies();
    await visit('/dev-login');
    await page.getByTestId(`dev-login-${devKey}`).click();
    await page.waitForURL(
      (u) => !u.pathname.startsWith('/dev-login') && !u.pathname.startsWith('/auth/continue'),
      { timeout: 120_000 },
    );
  };
  await login('dev-admin');
  const db = postgres(url, { max: 1, onnotice: () => {} });
  const [lead] = await db`select id from leads limit 1`;
  const [org] = await db`select id from organizations where slug = 'acme-roofing-demo'`;
  const [proj] = await db`select id from projects limit 1`;
  const [ticket] = await db`select id from support_tickets limit 1`;
  const [article] = await db`select id from articles limit 1`;
  await db.end();
  for (const r of [
    '/app',
    '/app/leads',
    '/app/leads/new',
    `/app/leads/${lead!.id}`,
    '/app/companies',
    '/app/proposals',
    '/app/clients',
    `/app/clients/${org!.id}`,
    `/app/clients/${org!.id}?tab=team`,
    `/app/clients/${org!.id}?tab=projects`,
    `/app/projects/${proj!.id}`,
    '/app/projects',
    '/app/tickets',
    `/app/tickets/${ticket!.id}`,
    '/app/tasks',
    '/app/content',
    `/app/content/${article!.id}`,
    '/app/settings',
    '/app/audit',
    '/app/analytics',
  ])
    await visit(r);
  await login('dev-client-a-owner');
  for (const r of [
    '/portal',
    '/portal/acme-roofing-demo',
    '/portal/acme-roofing-demo/support',
    '/portal/acme-roofing-demo/documents',
    '/portal/acme-roofing-demo/billing',
    '/portal/acme-roofing-demo/team',
  ])
    await visit(r);
  await browser.close();
}
