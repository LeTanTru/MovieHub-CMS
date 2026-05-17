import { LoginForm } from '@/app/(auth)/login/_components';
import { OG_IMAGE_HEIGHT, OG_IMAGE_WIDTH } from '@/constants';
import envConfig from '@/config';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Đăng nhập',
  description: 'Đăng nhập MovieHub CMS',
  metadataBase: new URL(envConfig.NEXT_PUBLIC_URL),
  keywords: ['MovieHub', 'CMS', 'đăng nhập', 'login'],
  alternates: {
    canonical: '/login'
  },
  openGraph: {
    title: 'Đăng nhập | MovieHub CMS',
    description: 'Đăng nhập MovieHub CMS',
    url: '/login',
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
    title: 'Đăng nhập | MovieHub CMS',
    description: 'Đăng nhập MovieHub CMS',
    images: ['/logo.webp']
  },
  robots: {
    index: false,
    follow: false
  }
};

export default function LoginPage() {
  return <LoginForm />;
}
