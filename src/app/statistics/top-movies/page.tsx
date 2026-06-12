import { OG_IMAGE_HEIGHT, OG_IMAGE_WIDTH } from '@/constants';
import { envConfig } from '@/config';
import { TopMoviesClient } from './top-movies-client';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Phim xem nhiều nhất',
  description:
    'Thống kê top phim được xem nhiều nhất trên MovieHub CMS, xếp hạng theo lượt xem, bình luận, đánh giá theo từng khoảng thời gian.',
  metadataBase: new URL(envConfig.NEXT_PUBLIC_URL),
  alternates: {
    canonical: '/statistics/top-movies'
  },
  openGraph: {
    title: 'Phim xem nhiều nhất | MovieHub CMS',
    description:
      'Thống kê top phim được xem nhiều nhất trên MovieHub CMS, xếp hạng theo lượt xem, bình luận, đánh giá theo từng khoảng thời gian.',
    url: '/statistics/top-movies',
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
    title: 'Phim xem nhiều nhất | MovieHub CMS',
    description:
      'Thống kê top phim được xem nhiều nhất trên MovieHub CMS, xếp hạng theo lượt xem, bình luận, đánh giá theo từng khoảng thời gian.',
    images: ['/logo.webp']
  },
  robots: { index: false, follow: false }
};

export default function TopMoviesPage() {
  return <TopMoviesClient />;
}
