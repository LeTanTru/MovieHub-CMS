import { StyleList } from '@/app/style/_components';
import envConfig from '@/config';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Thiết kế',
  description: 'Quản lý thiết kế giao diện MovieHub CMS',
  metadataBase: new URL(envConfig.NEXT_PUBLIC_URL),
  keywords: ['MovieHub', 'CMS', 'thiết kế', 'style', 'giao diện'],
  alternates: {
    canonical: '/style'
  },
  openGraph: {
    title: 'Thiết kế | MovieHub CMS',
    description: 'Quản lý thiết kế giao diện MovieHub CMS',
    url: '/style',
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
    title: 'Thiết kế | MovieHub CMS',
    description: 'Quản lý thiết kế giao diện MovieHub CMS',
    images: ['/logo.webp']
  },
  robots: { index: false, follow: false }
};

export default function StyleListPage() {
  return <StyleList />;
}
