import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Koral Digital',
    short_name: 'Koral',
    description: 'Lead response, CRM and automation partner for home-service businesses.',
    start_url: '/',
    display: 'standalone',
    background_color: '#FBF8F2',
    theme_color: '#082E46',
    icons: [
      { src: '/brand/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/brand/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
  };
}
