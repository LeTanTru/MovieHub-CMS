import { EmployeeList } from '@/app/employee/_components';
import { OG_IMAGE_HEIGHT, OG_IMAGE_WIDTH } from '@/constants';
import envConfig from '@/config';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Nhân viên',
  description: 'Quản lý tài khoản nhân viên MovieHub CMS',
  metadataBase: new URL(envConfig.NEXT_PUBLIC_URL),
  keywords: ['MovieHub', 'CMS', 'nhân viên', 'employee'],
  alternates: {
    canonical: '/employee'
  },
  openGraph: {
    title: 'Nhân viên | MovieHub CMS',
    description: 'Quản lý tài khoản nhân viên MovieHub CMS',
    url: '/employee',
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
    title: 'Nhân viên | MovieHub CMS',
    description: 'Quản lý tài khoản nhân viên MovieHub CMS',
    images: ['/logo.webp']
  },
  robots: { index: false, follow: false }
};

export default function EmployeeListPage() {
  return <EmployeeList />;
}
