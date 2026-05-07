import { MoviePersonTab } from '@/app/movie/[id]/movie-person/_components';
import envConfig from '@/config';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Diễn viên & đạo diễn',
  description: 'Quản lý diễn viên và đạo diễn trong phim MovieHub CMS',
  metadataBase: new URL(envConfig.NEXT_PUBLIC_URL),
  keywords: [
    'MovieHub',
    'CMS',
    'diễn viên',
    'đạo diễn',
    'movie person',
    'cast'
  ],
  alternates: {
    canonical: '/movie'
  },
  openGraph: {
    title: 'Diễn viên & đạo diễn | MovieHub CMS',
    description: 'Quản lý diễn viên và đạo diễn trong phim MovieHub CMS',
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
    title: 'Diễn viên & đạo diễn | MovieHub CMS',
    description: 'Quản lý diễn viên và đạo diễn trong phim MovieHub CMS',
    images: ['/logo.webp']
  },
  robots: { index: false, follow: false }
};

export default function MovieLPersonListPage() {
  return <MoviePersonTab />;
}
