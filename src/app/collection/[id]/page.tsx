import { CollectionForm } from '@/app/collection/_components';
import envConfig from '@/config';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Bộ sưu tập',
  description: 'Quản lý bộ sưu tập phim MovieHub CMS',
  metadataBase: new URL(envConfig.NEXT_PUBLIC_URL),
  keywords: ['MovieHub', 'CMS', 'bộ sưu tập', 'collection'],
  alternates: {
    canonical: '/collection'
  },
  openGraph: {
    title: 'Bộ sưu tập | MovieHub CMS',
    description: 'Quản lý bộ sưu tập phim MovieHub CMS',
    url: '/collection',
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
    title: 'Bộ sưu tập | MovieHub CMS',
    description: 'Quản lý bộ sưu tập phim MovieHub CMS',
    images: ['/logo.webp']
  },
  robots: { index: false, follow: false }
};

export default function CollectionSavePage() {
  return <CollectionForm />;
}
