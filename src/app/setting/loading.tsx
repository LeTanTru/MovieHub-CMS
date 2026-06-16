import { FormPageSkeleton } from '@/components/loading/form-page-skeleton';
import { Skeleton } from '@/components/ui/skeleton';

export default function Loading() {
  return (
    <FormPageSkeleton breadcrumbLevel={1} panelClassName='p-0'>
      {/* Tabs list skeleton */}
      <div className='relative flex h-auto w-full justify-start gap-1 border-b border-zinc-100 bg-transparent p-4'>
        <Skeleton className='h-9 w-28 rounded-t-md' />
        <Skeleton className='h-9 w-24 rounded-t-md' />
        <Skeleton className='h-9 w-20 rounded-t-md' />
      </div>

      <div className='p-4'>
        {/* Table actions skeleton (Reload + Add) */}
        <div className='mb-4 flex justify-end gap-2'>
          <Skeleton className='h-10 w-10 rounded' />
          <Skeleton className='h-10 w-32 rounded' />
        </div>

        {/* Table rows skeleton */}
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className='mb-4 flex items-center gap-4 border-b border-zinc-100 pb-4'
          >
            <div className='flex-1'>
              <Skeleton className='h-4 w-40' />
            </div>
            <Skeleton className='h-4 w-24' />
            <Skeleton className='h-4 w-24' />
            <Skeleton className='h-8 w-16' />
          </div>
        ))}
      </div>
    </FormPageSkeleton>
  );
}
