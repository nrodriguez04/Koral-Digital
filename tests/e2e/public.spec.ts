import { expect, test } from '@playwright/test';

test.describe('public marketing site', () => {
  test('every sitemap page renders with one H1, metadata and canonical', async ({ page, request }) => {
    const xml = await (await request.get('/sitemap.xml')).text();
    const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1]!).pathname);
    expect(urls.length).toBeGreaterThanOrEqual(20);
    for (const path of urls) {
      const res = await page.goto(path);
      expect(res?.status(), path).toBe(200);
      await expect(page.locator('h1'), path).toHaveCount(1);
      expect(await page.title(), path).toMatch(/Koral Digital/);
      expect(await page.locator('meta[name="description"]').getAttribute('content'), path).toBeTruthy();
      expect(await page.locator('link[rel="canonical"]').getAttribute('href'), path).toContain(
        path === '/' ? '' : path,
      );
      const body = (await page.locator('body').innerText()).toLowerCase();
      expect(body, path).not.toContain('lorem ipsum');
    }
  });

  test('no broken internal links on public pages', async ({ page, request }) => {
    const seen = new Set<string>();
    for (const start of [
      '/',
      '/services',
      '/industries',
      '/about',
      '/koral-initiative',
      '/contact',
      '/insights',
      '/services/lead-to-booked',
      '/industries/roofing',
    ]) {
      await page.goto(start);
      const hrefs = await page
        .locator('a[href^="/"]')
        .evaluateAll((as) => as.map((a) => (a as HTMLAnchorElement).getAttribute('href')!));
      hrefs.forEach((h) => seen.add(h.split('#')[0]!));
    }
    for (const href of seen) {
      if (!href || href.startsWith('/api/')) continue;
      const res = await request.get(href, { maxRedirects: 5 });
      expect(res.status(), href).toBeLessThan(400);
    }
  });

  test('structured data is valid JSON and truthful', async ({ page }) => {
    await page.goto('/');
    const blocks = await page.locator('script[type="application/ld+json"]').allTextContents();
    const parsed = blocks.map((b) => JSON.parse(b));
    const graph = parsed.find((p) => p['@graph'])['@graph'];
    expect(graph.map((n: { '@type': string }) => n['@type'])).toEqual(
      expect.arrayContaining(['Organization', 'ProfessionalService', 'WebSite']),
    );
    const text = JSON.stringify(parsed);
    // No unearned/unverifiable schema properties (checked as JSON keys, not prose).
    expect(text).not.toMatch(
      /"(aggregateRating|review|reviews|openingHours|openingHoursSpecification|priceRange|award)"\s*:/,
    );
    await page.goto('/services/lead-to-booked');
    const svc = (await page.locator('script[type="application/ld+json"]').allTextContents()).map((b) =>
      JSON.parse(b),
    );
    expect(svc.map((s) => s['@type'])).toEqual(
      expect.arrayContaining(['BreadcrumbList', 'Service', 'FAQPage']),
    );
  });

  test('Koral Initiative is clearly marked as planned with sources', async ({ page }) => {
    await page.goto('/koral-initiative');
    await expect(page.getByText('Status: planned')).toBeVisible();
    await expect(page.getByText('No contributions have been made yet.').first()).toBeVisible();
    expect(await page.locator('a:has-text("Source:")').count()).toBeGreaterThanOrEqual(4);
  });

  test('robots, sitemap, llms.txt and manifest are served; private areas are noindex', async ({
    request,
  }) => {
    expect((await request.get('/robots.txt')).status()).toBe(200);
    expect((await request.get('/llms.txt')).headers()['content-type']).toContain('text/plain');
    expect((await request.get('/manifest.webmanifest')).status()).toBe(200);
    const signIn = await request.get('/sign-in');
    expect(signIn.headers()['x-robots-tag']).toContain('noindex');
    const demo = await request.get('/demo');
    expect(await demo.text()).toContain('noindex');
  });

  test('private routes require authentication', async ({ page, request }) => {
    await page.goto('/app/leads');
    await expect(page).toHaveURL(/\/sign-in\?next=%2Fapp%2Fleads/);
    await page.goto('/portal/acme-roofing-demo');
    await expect(page).toHaveURL(/\/sign-in/);
    const file = await request.get('/api/files/00000000-0000-0000-0000-000000000000', { maxRedirects: 0 });
    expect(file.status()).toBe(401);
    const exp = await request.get('/app/leads/export', { maxRedirects: 0 });
    expect([307, 308]).toContain(exp.status());
  });

  test('mobile navigation opens and links work', async ({ browser }) => {
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
    const page = await ctx.newPage();
    await page.goto('/');
    await page.getByRole('button', { name: 'Open menu' }).click();
    await page.getByRole('dialog', { name: 'Site menu' }).getByRole('link', { name: 'About' }).click();
    await expect(page).toHaveURL(/\/about$/);
    await expect(page.getByRole('dialog', { name: 'Site menu' })).toBeHidden();
    await ctx.close();
  });

  test('contact form shows accessible validation errors', async ({ page }) => {
    await page.goto('/contact');
    await page.waitForTimeout(3000);
    await page.getByLabel('Your name').fill('X');
    await page.getByRole('button', { name: 'Request my free consultation' }).click();
    await expect(page.getByText('Your message was not sent yet')).toBeVisible();
    await expect(page.getByText('Please enter a valid email address.')).toBeVisible();
    await expect(page.getByLabel('Work email')).toHaveAttribute('aria-invalid', 'true');
  });
});
