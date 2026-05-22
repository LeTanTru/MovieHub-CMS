import { NotificationList } from '@/app/notification/_components';
import { envConfig } from '@/config';
import { OG_IMAGE_HEIGHT, OG_IMAGE_WIDTH } from '@/constants';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Thông báo',
  description: 'Quản lý thông báo MovieHub CMS',
  metadataBase: new URL(envConfig.NEXT_PUBLIC_URL),
  keywords: ['MovieHub', 'CMS', 'thông báo', 'notification'],
  alternates: {
    canonical: '/notification'
  },
  openGraph: {
    title: 'Thông báo | MovieHub CMS',
    description: 'Quản lý thông báo MovieHub CMS',
    url: '/notification',
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
    title: 'Thông báo | MovieHub CMS',
    description: 'Quản lý thông báo MovieHub CMS',
    images: ['/logo.webp']
  },
  robots: { index: false, follow: false }
};

export default function NotificationPage() {
  return <NotificationList />;
}
