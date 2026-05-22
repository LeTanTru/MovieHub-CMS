import { PersonForm } from '@/app/person/_components';
import { envConfig } from '@/config';
import { OG_IMAGE_HEIGHT, OG_IMAGE_WIDTH } from '@/constants';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Diễn viên & Đạo diễn',
  description: 'Quản lý diễn viên và đạo diễn MovieHub CMS',
  metadataBase: new URL(envConfig.NEXT_PUBLIC_URL),
  keywords: [
    'MovieHub',
    'CMS',
    'diễn viên',
    'đạo diễn',
    'person',
    'actor',
    'director'
  ],
  alternates: {
    canonical: '/person'
  },
  openGraph: {
    title: 'Diễn viên & Đạo diễn | MovieHub CMS',
    description: 'Quản lý diễn viên và đạo diễn MovieHub CMS',
    url: '/person',
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
    title: 'Diễn viên & Đạo diễn | MovieHub CMS',
    description: 'Quản lý diễn viên và đạo diễn MovieHub CMS',
    images: ['/logo.webp']
  },
  robots: { index: false, follow: false }
};

export default function PersonSavePage() {
  return <PersonForm />;
}
