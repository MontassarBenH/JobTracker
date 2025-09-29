// next.config.ts
import type { NextConfig } from 'next';
import withPWA from 'next-pwa';

const isDev = process.env.NODE_ENV === 'development';

const withPWAWrap = withPWA({
  dest: 'public',            // generates sw.js into /public
  register: true,            // auto-register on the client
  skipWaiting: true,         // activate new SW immediately
  disable: isDev,            // off in dev, on in prod
  fallbacks: { document: '/offline.html' }, 
  runtimeCaching: [
    // Next’s hashed build assets
    {
      urlPattern: ({ url }: any) => url.pathname.startsWith('/_next/static/'),
      handler: 'CacheFirst',
      options: { cacheName: 'next-static-assets' },
    },
    // CSS / images / fonts
    {
      urlPattern: ({ request }: any) =>
        ['style', 'image', 'font'].includes(request.destination),
      handler: 'StaleWhileRevalidate',
      options: { cacheName: 'assets' },
    },
    // Page navigations (App Router pages)
    {
      urlPattern: ({ request }: any) => request.mode === 'navigate',
      handler: 'NetworkFirst',
      options: { cacheName: 'pages', networkTimeoutSeconds: 3 },
    },
  ] as any,
});

const nextConfig: NextConfig = {
  reactStrictMode: true,
};

export default withPWAWrap(nextConfig);
