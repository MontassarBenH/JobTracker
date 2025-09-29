// next-pwa.d.ts
declare module 'next-pwa' {
  import type { NextConfig } from 'next';

  type PWAOptions = {
    dest: string;
    register?: boolean;
    skipWaiting?: boolean;
    disable?: boolean;
    fallbacks?: Record<string, string>;
    runtimeCaching?: any; // you can refine this if you want
  };

  export default function withPWA(
    options: PWAOptions
  ): (config: NextConfig) => NextConfig;
}
