import { SettingTab } from '@/app/setting/_components';
import { envConfig } from '@/config';
import { OG_IMAGE_HEIGHT, OG_IMAGE_WIDTH } from '@/constants';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Cài đặt',
  description: 'Quản lý cài đặt hệ thống MovieHub CMS',
  metadataBase: new URL(envConfig.NEXT_PUBLIC_URL),
  keywords: ['MovieHub', 'CMS', 'cài đặt', 'setting'],
  alternates: {
    canonical: '/setting'
  },
  openGraph: {
    title: 'Cài đặt | MovieHub CMS',
    description: 'Quản lý cài đặt hệ thống MovieHub CMS',
    url: '/setting',
    siteName: 'MovieHub',
    type: 'website',
    locale: 'vi_VN',
    images: [
      {
        url: '/logo.webp',
        width: OG_IMAGE_WIDTH,
        height: OG_IMAGE_HEIGHT,
        alt: 'MovieHub CMS'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Cài đặt | MovieHub CMS',
    description: 'Quản lý cài đặt hệ thống MovieHub CMS',
    images: ['/logo.webp']
  },
  robots: { index: false, follow: false }
};

export default function SettingPage() {
  return <SettingTab />;
}
