import { OG_IMAGE_HEIGHT, OG_IMAGE_WIDTH } from '@/constants';
import { envConfig } from '@/config';
import type { Metadata } from 'next';
import dynamic from 'next/dynamic';

const Overview = dynamic(
  () =>
    import('@/app/statistics/overview/_components').then((mod) => mod.Overview),
  { ssr: false }
);

export const metadata: Metadata = {
  title: 'Tổng quan thống kê',
  description:
    'Trang tổng quan thống kê MovieHub CMS, theo dõi lượt xem, bình luận, đánh giá và các chỉ số hiệu suất nội dung phim theo thời gian.',
  metadataBase: new URL(envConfig.NEXT_PUBLIC_URL),
  alternates: {
    canonical: '/statistics/overview'
  },
  openGraph: {
    title: 'Tổng quan thống kê | MovieHub CMS',
    description:
      'Trang tổng quan thống kê MovieHub CMS, theo dõi lượt xem, bình luận, đánh giá và các chỉ số hiệu suất nội dung phim theo thời gian.',
    url: '/statistics/overview',
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
    title: 'Tổng quan thống kê | MovieHub CMS',
    description:
      'Trang tổng quan thống kê MovieHub CMS, theo dõi lượt xem, bình luận, đánh giá và các chỉ số hiệu suất nội dung phim theo thời gian.',
    images: ['/logo.webp']
  },
  robots: { index: false, follow: false }
};

export default function OverviewPage() {
  return <Overview />;
}
