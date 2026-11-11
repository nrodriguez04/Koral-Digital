import path from 'node:path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, 'src'),
      'server-only': path.resolve(import.meta.dirname, 'tests/support/server-only.ts'),
      'next/headers': path.resolve(import.meta.dirname, 'tests/support/next-headers.ts'),
    },
  },
  test: {
    include: ['tests/unit/**/*.test.ts', 'tests/integration/**/*.test.ts'],
    globalSetup: ['tests/support/global-setup.ts'],
    environment: 'node',
    fileParallelism: false,
    testTimeout: 20000,
    env: {
      DATABASE_URL: process.env.TEST_DATABASE_URL ?? 'postgres://postgres@127.0.0.1:5432/koral_test',
      APP_SECRET: 'test-secret-0123456789abcdef0123456789abcdef',
      NODE_ENV: 'test',
      NEXT_PUBLIC_SITE_URL: 'https://koraldigital.com',
      STORAGE_DRIVER: 'none',
    },
  },
});
