import { MovieItemSeasonDetailList } from '@/app/movie/[id]/movie-item/_components';
import envConfig from '@/config';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Tập, trailer',
  description: 'Quản lý tập phim và trailer MovieHub CMS',
  metadataBase: new URL(envConfig.NEXT_PUBLIC_URL),
  keywords: ['MovieHub', 'CMS', 'tập phim', 'trailer', 'episode'],
  alternates: {
    canonical: '/movie'
  },
  openGraph: {
    title: 'Tập, trailer | MovieHub CMS',
    description: 'Quản lý tập phim và trailer MovieHub CMS',
    url: '/movie',
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
    title: 'Tập, trailer | MovieHub CMS',
    description: 'Quản lý tập phim và trailer MovieHub CMS',
    images: ['/logo.webp']
  },
  robots: { index: false, follow: false }
};

export default function MovieItemListPage() {
  return <MovieItemSeasonDetailList />;
}
