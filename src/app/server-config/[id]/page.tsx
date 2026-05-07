import { ServerConfigForm } from '@/app/server-config/_components';
import envConfig from '@/config';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Cấu hình server',
  description: 'Quản lý cấu hình server MovieHub CMS',
  metadataBase: new URL(envConfig.NEXT_PUBLIC_URL),
  keywords: ['MovieHub', 'CMS', 'cấu hình', 'server config'],
  alternates: {
    canonical: '/server-config'
  },
  openGraph: {
    title: 'Cấu hình server | MovieHub CMS',
    description: 'Quản lý cấu hình server MovieHub CMS',
    url: '/server-config',
    siteName: 'MovieHub',
    type: 'website',
    locale: 'vi_VN',
    images: [
      {
        url: '/logo.webp',
        width: 1200,
        height: 630,
        alt: 'MovieHub CMS'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Cấu hình server | MovieHub CMS',
    description: 'Quản lý cấu hình server MovieHub CMS',
    images: ['/logo.webp']
  },
  robots: { index: false, follow: false }
};

export default function StyleSavePage() {
  return <ServerConfigForm />;
}
