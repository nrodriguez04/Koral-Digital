import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';

const config = [
  ...nextVitals,
  ...nextTs,
  {
    ignores: [
      '.next/**',
      '.next-e2e/**',
      'node_modules/**',
      'drizzle/**',
      'playwright-report/**',
      'test-results/**',
      'next-env.d.ts',
      '.uploads/**',
    ],
  },
  {
    rules: {
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
    },
  },
];
export default config;
