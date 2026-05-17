import { VideoLibraryList } from '@/app/video-library/_components';
import { OG_IMAGE_HEIGHT, OG_IMAGE_WIDTH } from '@/constants';
import envConfig from '@/config';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Video',
  description: 'Quản lý thư viện video MovieHub CMS',
  metadataBase: new URL(envConfig.NEXT_PUBLIC_URL),
  keywords: ['MovieHub', 'CMS', 'video', 'thư viện video'],
  alternates: {
    canonical: '/video-library'
  },
  openGraph: {
    title: 'Video | MovieHub CMS',
    description: 'Quản lý thư viện video MovieHub CMS',
    url: '/video-library',
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
    title: 'Video | MovieHub CMS',
    description: 'Quản lý thư viện video MovieHub CMS',
    images: ['/logo.webp']
  },
  robots: { index: false, follow: false }
};

export default function VideoLibraryListPage() {
  return <VideoLibraryList />;
}
