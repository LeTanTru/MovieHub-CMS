'use client';

import { Skeleton } from '@/components/ui/skeleton';

export function ListPageSkeleton() {
  return (
    <main
      className='bg-page-wrapper overflow-hidden'
      style={{ height: 'calc(100vh - 64px)' }}
    >
      <div className='min-h-[calc(100vh-128px)]'>
        {/* Breadcrumb skeleton */}
        <div className='page-header flex items-center gap-2 px-5 py-4'>
          <Skeleton className='skeleton h-4 w-16' />
          <span className='text-zinc-400'>/</span>
          <Skeleton className='skeleton h-4 w-28' />
        </div>

        {/* Page Content */}
        <div className='page-content px-2 pb-2'>
          <div className='bg-list-page-wrapper min-h-[calc(100vh-190px)] rounded-lg'>
            <div className='bg-list-page-wrapper flex items-start justify-between rounded-tl-lg rounded-tr-lg p-4'>
              {/* Search Form Skeleton */}
              <div className='mr-4 mb-0 flex flex-1 flex-nowrap items-center gap-2'>
                <div className='grid flex-1 grid-cols-4 gap-2'>
                  <Skeleton className='h-10 w-full' />
                  <Skeleton className='h-10 w-full' />
                  <Skeleton className='h-10 w-full' />
                  <Skeleton className='h-10 w-full' />
                </div>
                {/* Search & Reset Buttons */}
                <div className='flex shrink-0 gap-2'>
                  <Skeleton className='h-10 w-10' />
                  <Skeleton className='h-10 w-10' />
                </div>
              </div>

              {/* Action Buttons Skeleton (Reload + Add) */}
              <div className='ml-2 flex shrink-0 gap-2'>
                {/* Reload button */}
                <Skeleton className='h-10 w-10 rounded' />
                {/* Add new button */}
                <Skeleton className='h-10 w-32 rounded' />
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
          </div>
        </div>
      </div>
    </main>
  );
}
