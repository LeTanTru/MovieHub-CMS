import type { NextConfig } from 'next';
import createBundleAnalyzer from '@next/bundle-analyzer';
import path from 'path';
import { envConfig } from '@/config';

const nextConfig: NextConfig = {
  async headers() {
    const isDev = process.env.NODE_ENV !== 'production';

    const cspHeader = `
      default-src 'self';
      script-src 'self' 'unsafe-inline' ${isDev ? "'unsafe-eval'" : ''} https://cdn.tiny.cloud https://tinymce-swart.vercel.app https://cdn.jsdelivr.net blob:;
      style-src 'self' 'unsafe-inline' https://tinymce-swart.vercel.app;
      img-src 'self' data: blob: https:;
      font-src 'self';
      media-src 'self' blob: https:;
      connect-src 'self' https: wss: blob:;
      worker-src 'self' blob:;
      frame-ancestors 'none';
    `
      .replace(/\s{2,}/g, ' ')
      .trim();

    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), payment=()'
          },
          {
            key: 'Content-Security-Policy',
            value: cspHeader
          }
        ]
      }
    ];
  },
  output: 'standalone',
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        pathname: '/**'
      },
      {
        protocol: 'https',
        hostname: envConfig.NEXT_PUBLIC_MEDIA_HOST,
        pathname: '/**'
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        pathname: '/**'
      }
    ]
  },
  outputFileTracingRoot: path.join(__dirname),
  reactCompiler: true,
  // Optimize CSS chunking and reduce network requests
  experimental: {
    optimizePackageImports: ['@vidstack/react'],
    optimizeCss: true
  },
  // Optimize bundle size
  compiler: {
    removeConsole:
      process.env.NODE_ENV === 'production'
        ? {
            exclude: ['log', 'error']
          }
        : false
  }
};

const withBundleAnalyzer = createBundleAnalyzer({
  enabled: process.env.ANALYZE === 'true'
});

export default withBundleAnalyzer(nextConfig);
