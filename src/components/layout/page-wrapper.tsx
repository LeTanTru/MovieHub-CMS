'use client';

import Footer from '@/components/footer';
import { Breadcrumb } from '@/components/form';
import { useFirstActiveRoute } from '@/hooks';
import { cn } from '@/lib';
import { BreadcrumbType } from '@/types';

export default function PageWrapper({
  children,
  breadcrumbs,
  loading,
  ...props
}: React.HTMLAttributes<HTMLElement> & {
  breadcrumbs: BreadcrumbType[];
  loading?: boolean;
}) {
  const firstRoutePath = useFirstActiveRoute();
  const fullBreadcrumbs: BreadcrumbType[] = [
    { label: 'Trang chủ', href: firstRoutePath },
    ...breadcrumbs
  ];
  return (
    <main
      className={cn('bg-page-wrapper h-[calc(100vh-64px)]', {
        'overflow-y-auto': !loading
      })}
      {...props}
    >
      <div className='min-h-[calc(100vh-128px)]'>
        <div className='page-header px-5 py-4'>
          <Breadcrumb items={fullBreadcrumbs} />
        </div>
        <div className='page-content px-2 pb-2'>{children}</div>
      </div>
      <Footer />
    </main>
  );
}
