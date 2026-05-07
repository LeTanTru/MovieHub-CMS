import { GroupForm } from '@/app/group-permission/_components';
import envConfig from '@/config';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Nhóm quyền',
  description: 'Quản lý nhóm quyền và phân quyền người dùng MovieHub CMS',
  metadataBase: new URL(envConfig.NEXT_PUBLIC_URL),
  keywords: ['MovieHub', 'CMS', 'nhóm quyền', 'permission', 'phân quyền'],
  alternates: {
    canonical: '/group-permission'
  },
  openGraph: {
    title: 'Nhóm quyền | MovieHub CMS',
    description: 'Quản lý nhóm quyền và phân quyền người dùng MovieHub CMS',
    url: '/group-permission',
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
    title: 'Nhóm quyền | MovieHub CMS',
    description: 'Quản lý nhóm quyền và phân quyền người dùng MovieHub CMS',
    images: ['/logo.webp']
  },
  robots: { index: false, follow: false }
};

export default function GroupDetailPage() {
  return <GroupForm />;
}
