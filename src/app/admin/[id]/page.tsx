import { AdminForm } from '@/app/admin/_components';
import { OG_IMAGE_HEIGHT, OG_IMAGE_WIDTH } from '@/constants';
import { envConfig } from '@/config';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Quản trị viên',
  description: 'Quản lý tài khoản quản trị viên MovieHub CMS',
  metadataBase: new URL(envConfig.NEXT_PUBLIC_URL),
  keywords: ['MovieHub', 'CMS', 'quản trị viên', 'admin'],
  alternates: {
    canonical: '/admin'
  },
  openGraph: {
    title: 'Quản trị viên | MovieHub CMS',
    description: 'Quản lý tài khoản quản trị viên MovieHub CMS',
    url: '/admin',
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
    title: 'Quản trị viên | MovieHub CMS',
    description: 'Quản lý tài khoản quản trị viên MovieHub CMS',
    images: ['/logo.webp']
  },
  robots: { index: false, follow: false }
};

export default function AdminSavePage() {
  return <AdminForm />;
}
