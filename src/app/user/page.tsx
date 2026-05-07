import { UserList } from '@/app/user/_components';
import envConfig from '@/config';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Người dùng',
  description: 'Quản lý tài khoản người dùng MovieHub CMS',
  metadataBase: new URL(envConfig.NEXT_PUBLIC_URL),
  keywords: ['MovieHub', 'CMS', 'người dùng', 'user'],
  alternates: {
    canonical: '/user'
  },
  openGraph: {
    title: 'Người dùng | MovieHub CMS',
    description: 'Quản lý tài khoản người dùng MovieHub CMS',
    url: '/user',
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
    title: 'Người dùng | MovieHub CMS',
    description: 'Quản lý tài khoản người dùng MovieHub CMS',
    images: ['/logo.webp']
  },
  robots: { index: false, follow: false }
};

export default function UserListPage() {
  return <UserList />;
}
