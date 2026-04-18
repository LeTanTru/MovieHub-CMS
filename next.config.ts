import type { NextConfig } from 'next';
import createBundleAnalyzer from '@next/bundle-analyzer';
import path from 'path';
import envConfig from './src/config';

const nextConfig: NextConfig = {
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
