import { OG_IMAGE_HEIGHT, OG_IMAGE_WIDTH } from '@/constants';
import { envConfig } from '@/config';
import { MovieDistributionClient } from './movie-distribution-client';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Phân bố phim',
  description:
    'Thống kê phân bố nội dung phim trên MovieHub CMS theo thể loại, quốc gia và các tiêu chí phân loại khác.',
  metadataBase: new URL(envConfig.NEXT_PUBLIC_URL),
  alternates: {
    canonical: '/statistics/movie-distribution'
  },
  openGraph: {
    title: 'Phân bố phim | MovieHub CMS',
    description:
      'Thống kê phân bố nội dung phim trên MovieHub CMS theo thể loại, quốc gia và các tiêu chí phân loại khác.',
    url: '/statistics/movie-distribution',
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
    title: 'Phân bố phim | MovieHub CMS',
    description:
      'Thống kê phân bố nội dung phim trên MovieHub CMS theo thể loại, quốc gia và các tiêu chí phân loại khác.',
    images: ['/logo.webp']
  },
  robots: { index: false, follow: false }
};

export default function MovieDistributionPage() {
  return <MovieDistributionClient />;
}
