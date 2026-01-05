'use client';

import { notFound as notFoundIcon } from '@/assets';
import { Footer } from '@/components/footer';
import { Breadcrumb } from '@/components/form';
import { NotFound } from '@/components/not-found';
import { useFirstActiveRoute } from '@/hooks';
import { cn } from '@/lib';
import { BreadcrumbType } from '@/types';

export default function PageWrapper({
  children,
  breadcrumbs,
  loading,
  notFound,
  notFoundContent,
  ...props
}: React.HTMLAttributes<HTMLElement> & {
  breadcrumbs: BreadcrumbType[];
  loading?: boolean;
  notFound?: boolean;
  notFoundContent?: string;
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
        {notFound ? (
          <NotFound
            icon={notFoundIcon}
            title={notFoundContent ?? 'Không tìm thấy'}
          />
        ) : (
          <div className='page-content px-2 pb-2'>{children}</div>
        )}
      </div>
      <Footer />
    </main>
  );
}
