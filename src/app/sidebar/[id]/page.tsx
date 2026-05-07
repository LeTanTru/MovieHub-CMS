import { SidebarForm } from '@/app/sidebar/_components';
import envConfig from '@/config';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Phim hot',
  description: 'Quản lý phim hot trên trang chủ MovieHub CMS',
  metadataBase: new URL(envConfig.NEXT_PUBLIC_URL),
  keywords: ['MovieHub', 'CMS', 'phim hot', 'sidebar'],
  alternates: {
    canonical: '/sidebar'
  },
  openGraph: {
    title: 'Phim hot | MovieHub CMS',
    description: 'Quản lý phim hot trên trang chủ MovieHub CMS',
    url: '/sidebar',
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
    title: 'Phim hot | MovieHub CMS',
    description: 'Quản lý phim hot trên trang chủ MovieHub CMS',
    images: ['/logo.webp']
  },
  robots: { index: false, follow: false }
};

export default function SidebarSavePage() {
  return <SidebarForm />;
}
