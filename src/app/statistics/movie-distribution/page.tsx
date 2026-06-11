import { OG_IMAGE_HEIGHT, OG_IMAGE_WIDTH } from '@/constants';
import { envConfig } from '@/config';
import type { Metadata } from 'next';
import dynamic from 'next/dynamic';

const MovieDistribution = dynamic(
  () =>
    import('@/app/statistics/movie-distribution/_components').then(
      (mod) => mod.MovieDistribution
    ),
  { ssr: false }
);

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
  return <MovieDistribution />;
}
