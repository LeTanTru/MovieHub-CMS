import { CollectionItemList } from '@/app/collection/[id]/collection-item/_components';
import { OG_IMAGE_HEIGHT, OG_IMAGE_WIDTH } from '@/constants';
import envConfig from '@/config';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Phim',
  description: 'Quản lý phim trong bộ sưu tập MovieHub CMS',
  metadataBase: new URL(envConfig.NEXT_PUBLIC_URL),
  keywords: ['MovieHub', 'CMS', 'bộ sưu tập', 'phim', 'collection item'],
  alternates: {
    canonical: '/collection'
  },
  openGraph: {
    title: 'Phim | MovieHub CMS',
    description: 'Quản lý phim trong bộ sưu tập MovieHub CMS',
    url: '/collection',
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
    title: 'Phim | MovieHub CMS',
    description: 'Quản lý phim trong bộ sưu tập MovieHub CMS',
    images: ['/logo.webp']
  },
  robots: { index: false, follow: false }
};

export default function CollectionItemListPage() {
  return <CollectionItemList />;
}
