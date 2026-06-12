import { VideoLibrarySubtitleList } from '@/app/video-library/[id]/subtitle/_components';
import { OG_IMAGE_HEIGHT, OG_IMAGE_WIDTH } from '@/constants';
import { envConfig } from '@/config';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Phụ đề',
  description: 'Quản lý phụ đề video MovieHub CMS',
  metadataBase: new URL(envConfig.NEXT_PUBLIC_URL),
  keywords: ['MovieHub', 'CMS', 'phụ đề', 'subtitle', 'video'],
  alternates: {
    canonical: '/video-library'
  },
  openGraph: {
    title: 'Phụ đề | MovieHub CMS',
    description: 'Quản lý phụ đề video MovieHub CMS',
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
    title: 'Phụ đề | MovieHub CMS',
    description: 'Quản lý phụ đề video MovieHub CMS',
    images: ['/logo.webp']
  },
  robots: { index: false, follow: false }
};

export default function VideoLibrarySubtitlePage() {
  return <VideoLibrarySubtitleList />;
}
