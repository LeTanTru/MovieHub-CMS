'use client';

import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

const BREADCRUMB_WIDTHS = ['w-16', 'w-28', 'w-36', 'w-32'];

function BreadcrumbSkeleton({ level }: { level: number }) {
  return (
    <div className='page-header flex items-center gap-2 px-5 py-4'>
      {Array.from({ length: level }).map((_, index) => (
        <div key={index} className='flex items-center gap-2'>
          <Skeleton
            className={cn('skeleton h-4', BREADCRUMB_WIDTHS[index] ?? 'w-32')}
          />
          {index < level - 1 && <span className='text-zinc-400'>/</span>}
        </div>
      ))}
    </div>
  );
}

type ListPageSkeletonProps = {
  searchFieldsCount?: number;
  hasSearchForm?: boolean;
  hasAddButton?: boolean;
  breadcrumbLevel?: number;
  hasTabs?: boolean;
  tabsCount?: number;
};

export function ListPageSkeleton({
  searchFieldsCount = 4,
  hasSearchForm = true,
  hasAddButton = true,
  breadcrumbLevel = 2,
  hasTabs = false,
  tabsCount = 2
}: ListPageSkeletonProps = {}) {
  const innerContent = (
    <>
      <div className='bg-list-page-wrapper flex items-start justify-between rounded-tl-lg rounded-tr-lg p-4'>
        {/* Search Form Skeleton */}
        {hasSearchForm && searchFieldsCount > 0 ? (
          <div className='mr-4 mb-0 flex flex-1 flex-nowrap items-center gap-2'>
            <div className='grid flex-1 grid-cols-4 gap-2'>
              {Array.from({ length: searchFieldsCount }).map((_, i) => (
                <Skeleton key={i} className='h-10 w-full' />
              ))}
              {searchFieldsCount < 4 && (
                <div className='flex gap-2'>
                  <Skeleton className='h-10 w-10' />
                  <Skeleton className='h-10 w-10' />
                </div>
              )}
            </div>
            {searchFieldsCount >= 4 && (
              <div className='flex shrink-0 gap-2'>
                <Skeleton className='h-10 w-10' />
                <Skeleton className='h-10 w-10' />
              </div>
            )}
          </div>
        ) : (
          <div className='flex-1' />
        )}

        {/* Action Buttons Skeleton (Reload + Add) */}
        <div className='ml-2 flex shrink-0 gap-2'>
          {/* Reload button */}
          <Skeleton className='h-10 w-10 rounded' />
          {/* Add new button */}
          {hasAddButton && <Skeleton className='h-10 w-32 rounded' />}
        </div>
      </div>

      <div className='rounded-br-lg rounded-bl-lg p-4'>
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className='mb-4 flex items-center gap-4 border-b border-zinc-100 pb-4'
          >
            <Skeleton className='size-12 rounded' />
            <Skeleton className='h-12 w-16 rounded' />
            <div className='flex-1'>
              <Skeleton className='mb-2 h-4 w-64' />
              <Skeleton className='h-3 w-48' />
            </div>
            <Skeleton className='h-4 w-24' />
            <Skeleton className='h-4 w-32' />
            <Skeleton className='h-4 w-16' />
            <Skeleton className='h-4 w-20' />
            <Skeleton className='h-8 w-24' />
          </div>
        ))}
        <div className='mt-4 flex items-center justify-between'>
          <Skeleton className='h-4 w-32' />
          <div className='flex gap-2'>
            <Skeleton className='size-8' />
            <Skeleton className='size-8' />
            <Skeleton className='size-8' />
            <Skeleton className='size-8' />
            <Skeleton className='size-8' />
          </div>
        </div>
      </div>
    </>
  );

  return (
    <main
      className='bg-page-wrapper overflow-hidden'
      style={{ height: 'calc(100vh - 64px)' }}
    >
      <div className='min-h-[calc(100vh-128px)]'>
        {/* Breadcrumb skeleton */}
        <BreadcrumbSkeleton level={breadcrumbLevel} />

        {/* Page Content */}
        <div className='page-content px-2 pb-2'>
          {hasTabs ? (
            <div className='rounded-lg bg-white'>
              <div className='relative flex h-auto w-full justify-start gap-0.5 bg-transparent p-4 before:absolute before:inset-x-0 before:bottom-0 before:h-px before:bg-zinc-100'>
                {Array.from({ length: tabsCount }).map((_, i) => (
                  <Skeleton
                    key={i}
                    className='h-10 w-24 rounded-b-none border-x border-t'
                  />
                ))}
              </div>
              <div className='bg-list-page-wrapper min-h-[calc(100vh-250px)] rounded-b-lg'>
                {innerContent}
              </div>
            </div>
          ) : (
            <div className='bg-list-page-wrapper min-h-[calc(100vh-190px)] rounded-lg'>
              {innerContent}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
