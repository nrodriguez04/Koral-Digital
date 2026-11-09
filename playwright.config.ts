import { tmpdir } from 'node:os';
import path from 'node:path';
import { defineConfig, devices } from '@playwright/test';

const PORT = 3100;
const E2E_DB = process.env.E2E_DATABASE_URL ?? 'postgres://postgres@127.0.0.1:5432/koral_e2e';

export default defineConfig({
  testDir: './tests/e2e',
  // Keep artifacts outside the project: the dev server watches the project tree.
  outputDir: path.join(tmpdir(), 'koral-e2e', 'test-results'),
  fullyParallel: false,
  workers: 1,
  retries: 0,
  timeout: 90_000,
  expect: { timeout: 15_000 },
  reporter: [['list']],
  globalSetup: './tests/e2e/global-setup.ts',
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: 'off',
    ...devices['Desktop Chrome'],
    launchOptions: process.env.PW_CHROMIUM_PATH
      ? { executablePath: process.env.PW_CHROMIUM_PATH }
      : undefined,
  },
  webServer: {
    // Development server: the dev-only auth mock is unavailable in production builds by design.
    command: `npx next dev -p ${PORT}`,
    url: `http://localhost:${PORT}/robots.txt`,
    timeout: 180_000,
    reuseExistingServer: true,
    env: {
      DATABASE_URL: E2E_DB,
      AUTH_DEV_MOCK: 'true',
      STORAGE_DRIVER: 'local',
      APP_SECRET: 'e2e-secret-0123456789abcdef0123456789abcdef',
      NEXT_PUBLIC_SITE_URL: `http://localhost:${PORT}`,
      NEXT_PUBLIC_DESCOPE_PROJECT_ID: '',
    },
  },
});
