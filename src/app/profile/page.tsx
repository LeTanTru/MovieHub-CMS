import { ProfileForm } from '@/app/profile/_components';
import { envConfig } from '@/config';
import { OG_IMAGE_HEIGHT, OG_IMAGE_WIDTH } from '@/constants';
import { ListPageWrapper, PageWrapper } from '@/components/layout';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Hồ sơ',
  description: 'Quản lý hồ sơ cá nhân MovieHub CMS',
  metadataBase: new URL(envConfig.NEXT_PUBLIC_URL),
  keywords: ['MovieHub', 'CMS', 'hồ sơ', 'profile'],
  alternates: {
    canonical: '/profile'
  },
  openGraph: {
    title: 'Hồ sơ | MovieHub CMS',
    description: 'Quản lý hồ sơ cá nhân MovieHub CMS',
    url: '/profile',
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
    title: 'Hồ sơ | MovieHub CMS',
    description: 'Quản lý hồ sơ cá nhân MovieHub CMS',
    images: ['/logo.webp']
  },
  robots: { index: false, follow: false }
};

export default function ProfilePage() {
  return (
    <PageWrapper breadcrumbs={[{ label: 'Hồ sơ' }]}>
      <ListPageWrapper>
        <ProfileForm />
      </ListPageWrapper>
    </PageWrapper>
  );
}
