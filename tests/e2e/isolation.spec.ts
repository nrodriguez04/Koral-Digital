import { expect, test } from '@playwright/test';
import { loginAs, sql } from './helpers';

test.describe('tenant isolation in the browser', () => {
  test('Org A owner cannot reach Org B by changing URLs', async ({ page }) => {
    const db = sql();
    const [b] =
      await db`select t.id from support_tickets t join organizations o on o.id = t.org_id where o.slug = 'bluebonnet-demo' limit 1`;
    const [pb] =
      await db`select p.id from projects p join organizations o on o.id = p.org_id where o.slug = 'bluebonnet-demo' limit 1`;
    await db.end();
    await loginAs(page, 'dev-client-a-owner');
    await expect(page).toHaveURL(/\/portal\/acme-roofing-demo$/);
    expect((await page.goto('/portal/bluebonnet-demo'))?.status()).toBe(404);
    expect((await page.goto(`/portal/acme-roofing-demo/support/${b!.id}`))?.status()).toBe(404);
    expect((await page.goto(`/portal/acme-roofing-demo/projects/${pb!.id}`))?.status()).toBe(404);
  });

  test('clients never see internal notes, hidden milestones or draft invoices', async ({ page }) => {
    await loginAs(page, 'dev-client-a-owner');
    await page.getByRole('link', { name: 'Support', exact: true }).click();
    await page.getByRole('link', { name: 'Question about alerts (synthetic)' }).click();
    await expect(page.getByText('Who receives the new-lead alerts?')).toBeVisible();
    await expect(page.getByText('INTERNAL: check routing rules')).toHaveCount(0);
    await page.goto('/portal/acme-roofing-demo');
    await page.getByRole('link', { name: /Acme — Lead-to-Booked pilot/ }).click();
    await expect(page.getByText('Access granted')).toBeVisible();
    await expect(page.getByText('Internal QA (hidden from client)')).toHaveCount(0);
    await expect(page.getByText('Internal: record baseline metrics')).toHaveCount(0);
    await page.goto('/portal/acme-roofing-demo/billing');
    await expect(page.getByText('DEMO-001')).toBeVisible();
    await expect(page.getByText('DEMO-002')).toHaveCount(0);
  });

  test('read-only members cannot open requests or manage the team', async ({ page }) => {
    await loginAs(page, 'dev-client-a-readonly');
    await page.goto('/portal/acme-roofing-demo/support');
    await expect(page.getByRole('button', { name: 'Submit request' })).toHaveCount(0);
    await page.goto('/portal/acme-roofing-demo/team');
    await expect(page).toHaveURL(/denied=1/);
  });

  test('clients cannot open the internal portal; staff roles are enforced', async ({ page }) => {
    await loginAs(page, 'dev-client-b-owner');
    await page.goto('/app/leads');
    await expect(page).toHaveURL(/\/no-access|\/portal/);
    await loginAs(page, 'dev-sales');
    await page.goto('/app/settings');
    await expect(page).toHaveURL(/\/app\?denied=1/);
    await expect(page.getByText('You do not have permission to open that page.')).toBeVisible();
  });
});
