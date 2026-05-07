import { EmployeeForm } from '@/app/employee/_components';
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
        width: 1200,
        height: 630,
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

export default function EmployeeSavePage() {
  return <EmployeeForm />;
}
