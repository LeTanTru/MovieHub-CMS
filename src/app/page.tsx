import envConfig from '@/config';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Trang chủ',
  description:
    'Hệ thống quản trị nội dung phim MovieHub, quản lý phim, series phim, diễn viên, đạo diễn, thể loại, quốc gia, đánh giá và bình luận.',
  metadataBase: new URL(envConfig.NEXT_PUBLIC_URL),
  alternates: {
    canonical: '/'
  },
  openGraph: {
    title: 'MovieHub CMS - Hệ thống quản trị nội dung phim',
    description:
      'Hệ thống quản trị nội dung phim MovieHub, quản lý phim, series phim, diễn viên, đạo diễn, thể loại, quốc gia, đánh giá và bình luận.',
    url: '/',
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
    title: 'MovieHub CMS - Hệ thống quản trị nội dung phim',
    description:
      'Hệ thống quản trị nội dung phim MovieHub, quản lý phim, series phim, diễn viên, đạo diễn, thể loại, quốc gia, đánh giá và bình luận.',
    images: ['/logo.webp']
  },
  robots: { index: false, follow: false }
};

export default function HomePage() {
  return <></>;
}
