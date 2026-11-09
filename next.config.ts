import type { NextConfig } from 'next';

const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=()' },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
  { key: 'Cross-Origin-Opener-Policy', value: 'same-origin-allow-popups' },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  images: { formats: ['image/avif', 'image/webp'] },
  serverExternalPackages: ['postgres'],
  experimental: {
    serverActions: { bodySizeLimit: '5mb' },
  },
  async headers() {
    return [
      { source: '/:path*', headers: securityHeaders },
      {
        // Private areas and APIs must never be indexed (auth is the real protection).
        source: '/:area(app|portal|api|sign-in|invite|setup|no-access|dev-login)/:path*',
        headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }],
      },
      {
        source: '/:area(app|portal|sign-in|invite|setup|no-access|dev-login)',
        headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }],
      },
      {
        source: '/brand/:path*',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=604800, stale-while-revalidate=86400' }],
      },
    ];
  },
  async redirects() {
    return [
      { source: '/services/crm', destination: '/services/crm-implementation', permanent: true },
      { source: '/blog', destination: '/insights', permanent: true },
      { source: '/blog/:slug', destination: '/insights/:slug', permanent: true },
      { source: '/login', destination: '/sign-in', permanent: false },
      { source: '/internal', destination: '/app', permanent: false },
      { source: '/internal/:path*', destination: '/app/:path*', permanent: false },
    ];
  },
};

export default nextConfig;
