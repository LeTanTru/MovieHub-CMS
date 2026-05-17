import { MovieForm } from '@/app/movie/_components';
import envConfig from '@/config';
import { OG_IMAGE_HEIGHT, OG_IMAGE_WIDTH } from '@/constants';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Phim',
  description: 'Quản lý phim, series phim MovieHub CMS',
  metadataBase: new URL(envConfig.NEXT_PUBLIC_URL),
  keywords: ['MovieHub', 'CMS', 'phim', 'movie', 'series'],
  alternates: {
    canonical: '/movie'
  },
  openGraph: {
    title: 'Phim | MovieHub CMS',
    description: 'Quản lý phim, series phim MovieHub CMS',
    url: '/movie',
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
    title: 'Phim | MovieHub CMS',
    description: 'Quản lý phim, series phim MovieHub CMS',
    images: ['/logo.webp']
  },
  robots: { index: false, follow: false }
};

export default function MovieSavePage() {
  return <MovieForm />;
}
