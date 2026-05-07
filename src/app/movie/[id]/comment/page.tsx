import { CommentList } from '@/app/movie/[id]/comment/_components';
import envConfig from '@/config';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Bình luận',
  description: 'Quản lý bình luận phim MovieHub CMS',
  metadataBase: new URL(envConfig.NEXT_PUBLIC_URL),
  keywords: ['MovieHub', 'CMS', 'bình luận', 'comment'],
  alternates: {
    canonical: '/movie'
  },
  openGraph: {
    title: 'Bình luận | MovieHub CMS',
    description: 'Quản lý bình luận phim MovieHub CMS',
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
    title: 'Bình luận | MovieHub CMS',
    description: 'Quản lý bình luận phim MovieHub CMS',
    images: ['/logo.webp']
  },
  robots: { index: false, follow: false }
};

export default function CommentListPage() {
  return <CommentList />;
}
