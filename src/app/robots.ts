import envConfig from '@/config';

export default function robots() {
  const baseUrl = envConfig.NEXT_PUBLIC_URL;

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin/',
          '/api/',
          '/movie/',
          '/person/',
          '/collection/',
          '/video-library/',
          '/employee/',
          '/group-permission/',
          '/app-version/',
          '/server-config/',
          '/notification/',
          '/category/',
          '/style/',
          '/sidebar/',
          '/user/',
          '/setting/',
          '/profile/'
        ]
      }
    ],
    sitemap: `${baseUrl}/sitemap.xml`
  };
}
