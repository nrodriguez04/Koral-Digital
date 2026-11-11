import { expect, type Page } from '@playwright/test';
import postgres from 'postgres';

export const sql = () =>
  postgres(process.env.E2E_DATABASE_URL ?? 'postgres://postgres@127.0.0.1:5432/koral_e2e', {
    max: 1,
    onnotice: () => {},
  });

export async function loginAs(page: Page, devKey: string, next?: string) {
  await page.context().clearCookies();
  await page.goto(`/dev-login${next ? `?next=${encodeURIComponent(next)}` : ''}`);
  await page.getByTestId(`dev-login-${devKey}`).click();
  await page.waitForURL(
    (u) => !u.pathname.startsWith('/dev-login') && !u.pathname.startsWith('/auth/continue'),
  );
}

export async function expectNoAppError(page: Page) {
  await expect(page.getByText('This page could not be loaded')).toHaveCount(0);
}
