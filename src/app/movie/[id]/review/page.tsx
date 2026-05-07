import { ReviewList } from '@/app/movie/[id]/review/_components';
import envConfig from '@/config';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Đánh giá',
  description: 'Quản lý đánh giá phim MovieHub CMS',
  metadataBase: new URL(envConfig.NEXT_PUBLIC_URL),
  keywords: ['MovieHub', 'CMS', 'đánh giá', 'review'],
  alternates: {
    canonical: '/movie'
  },
  openGraph: {
    title: 'Đánh giá | MovieHub CMS',
    description: 'Quản lý đánh giá phim MovieHub CMS',
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
    title: 'Đánh giá | MovieHub CMS',
    description: 'Quản lý đánh giá phim MovieHub CMS',
    images: ['/logo.webp']
  },
  robots: { index: false, follow: false }
};

export default function ReviewListPage() {
  return <ReviewList />;
}
