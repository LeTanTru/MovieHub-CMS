import { MovieItemSeasonList } from '@/app/movie/[id]/movie-item/_components';
import { envConfig } from '@/config';
import { OG_IMAGE_HEIGHT, OG_IMAGE_WIDTH } from '@/constants';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Phần',
  description: 'Quản lý phần/phim lẻ của series MovieHub CMS',
  metadataBase: new URL(envConfig.NEXT_PUBLIC_URL),
  keywords: ['MovieHub', 'CMS', 'phim', 'phần', 'season', 'movie item'],
  alternates: {
    canonical: '/movie'
  },
  openGraph: {
    title: 'Phần | MovieHub CMS',
    description: 'Quản lý phần/phim lẻ của series MovieHub CMS',
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
    title: 'Phần | MovieHub CMS',
    description: 'Quản lý phần/phim lẻ của series MovieHub CMS',
    images: ['/logo.webp']
  },
  robots: { index: false, follow: false }
};

export default function MovieItemListPage() {
  return <MovieItemSeasonList />;
}
