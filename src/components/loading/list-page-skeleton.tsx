'use client';

import { Skeleton } from '@/components/ui/skeleton';

function ListPageSkeleton() {
  return (
    <div className='bg-list-page-wrapper min-h-[calc(100vh-190px)] rounded-lg'>
      <div className='bg-list-page-wrapper flex items-start justify-between rounded-tl-lg rounded-tr-lg p-4'>
        <div className='flex-1'>
          <div className='mb-4 flex gap-4'>
            <Skeleton className='h-10 w-48' />
            <Skeleton className='h-10 w-48' />
            <Skeleton className='h-10 w-32' />
            <Skeleton className='h-10 w-32' />
          </div>
          <div className='mb-4 flex gap-2'>
            <Skeleton className='h-10 w-24' />
            <Skeleton className='h-10 w-24' />
          </div>
        </div>
        <div className='ml-2 flex gap-2'>
          <Skeleton className='h-10 w-24' />
          <Skeleton className='h-10 w-32' />
        </div>
      </div>
      <div className='rounded-br-lg rounded-bl-lg p-4'>
        <div className='mb-4 flex gap-4 border-b pb-3'>
          <Skeleton className='h-4 w-16' />
          <Skeleton className='h-4 w-24' />
          <Skeleton className='h-4 w-48' />
          <Skeleton className='h-4 w-24' />
          <Skeleton className='h-4 w-32' />
          <Skeleton className='h-4 w-24' />
          <Skeleton className='h-4 w-24' />
          <Skeleton className='h-4 w-20' />
        </div>
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
  );
}

export default ListPageSkeleton;
