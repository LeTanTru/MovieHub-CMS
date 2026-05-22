'use client';

import { notFound as notFoundIcon } from '@/assets';
import { Footer } from '@/components/footer';
import { Breadcrumb } from '@/components/form';
import { NotFound } from '@/components/not-found';
import { useFirstActiveRoute } from '@/hooks';
import { cn } from '@/lib';
import type { BreadcrumbType } from '@/types';
import type { HTMLAttributes } from 'react';

const HEADER_HEIGHT_PX = 64;

type PageWrapperProps = HTMLAttributes<HTMLElement> & {
  breadcrumbs: BreadcrumbType[];
  loading?: boolean;
  notFound?: boolean;
  notFoundContent?: string;
};

export function PageWrapper({
  children,
  breadcrumbs,
  loading,
  notFound,
  notFoundContent,
  ...props
}: PageWrapperProps) {
  const scrollContainerId = props.id || 'page-wrapper-scroll-container';
  const firstRoutePath = useFirstActiveRoute();
  const fullBreadcrumbs: BreadcrumbType[] = [
    { label: 'Trang chủ', href: firstRoutePath },
    ...breadcrumbs
  ];
  return (
    <main
      id={scrollContainerId}
      className={cn('bg-page-wrapper', {
        'overflow-y-auto': !loading
      })}
      style={{ height: `calc(100vh - ${HEADER_HEIGHT_PX}px)` }}
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
