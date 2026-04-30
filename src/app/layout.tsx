import './globals.css';
import { Be_Vietnam_Pro } from 'next/font/google';
import { ToastContainer } from 'react-toastify';
import NextTopLoader from 'nextjs-toploader';
import { type ReactNode, Suspense } from 'react';
import type { Metadata } from 'next';
import { PermissionGuard } from '@/components/permission-guard';
import { QueryProvider } from '@/components/providers/query-provider';
import { ThemeProvider } from '@/components/providers/theme-provider';
import { AppProvider } from '@/components/providers/app-provider';
import { Loader } from 'lucide-react';

const beVietnamPro = Be_Vietnam_Pro({
  weight: ['300', '400', '500', '600', '700', '800'],
  subsets: ['latin'],
  variable: '--font-be-vietnam-pro',
  display: 'swap',
  preload: true
});

export const metadata: Metadata = {
  title: {
    template: '%s | MovieHub CMS',
    default: 'MovieHub CMS'
  }
};

type RootLayoutProps = {
  children: ReactNode;
};

export default async function RootLayout({ children }: RootLayoutProps) {
  return (
    <html suppressHydrationWarning lang='vi'>
      <body
        suppressHydrationWarning
        className={`${beVietnamPro.variable} ${beVietnamPro.className} antialiased`}
      >
        <ThemeProvider
          attribute='class'
          defaultTheme='light'
          enableSystem
          disableTransitionOnChange
        >
          <QueryProvider>
            <AppProvider>
              <Suspense
                fallback={
                  <div className='flex h-screen items-center justify-center'>
                    <Loader className='size-8 animate-spin' />
                  </div>
                }
              >
                <PermissionGuard>{children}</PermissionGuard>
              </Suspense>
              <NextTopLoader showSpinner={false} />
            </AppProvider>
          </QueryProvider>
        </ThemeProvider>
        <ToastContainer />
      </body>
    </html>
  );
}
