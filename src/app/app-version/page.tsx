import { AppVersionList } from '@/app/app-version/_components';
import { OG_IMAGE_HEIGHT, OG_IMAGE_WIDTH } from '@/constants';
import envConfig from '@/config';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Phiên bản ứng dụng',
  description: 'Quản lý phiên bản ứng dụng MovieHub CMS',
  metadataBase: new URL(envConfig.NEXT_PUBLIC_URL),
  keywords: ['MovieHub', 'CMS', 'phiên bản', 'app version'],
  alternates: {
    canonical: '/app-version'
  },
  openGraph: {
    title: 'Phiên bản ứng dụng | MovieHub CMS',
    description: 'Quản lý phiên bản ứng dụng MovieHub CMS',
    url: '/app-version',
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
    title: 'Phiên bản ứng dụng | MovieHub CMS',
    description: 'Quản lý phiên bản ứng dụng MovieHub CMS',
    images: ['/logo.webp']
  },
  robots: { index: false, follow: false }
};

export default function AppVersionListPage() {
  return <AppVersionList />;
}
