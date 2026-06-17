import { FormPageSkeleton } from '@/components/loading/form-page-skeleton';
import { CommentItemSkeleton } from '@/app/movie/[id]/comment/_components';
import { SKELETON_LOADING_COUNT } from '@/constants';

export default function Loading() {
  return (
    <FormPageSkeleton breadcrumbLevel={4}>
      {/* CommentInput skeleton */}
      <div className='mb-4'>
        <div className='skeleton mb-2 h-46.5 w-full rounded-md' />
        <div className='ml-auto flex w-fit items-center gap-2'>
          <div className='skeleton size-8 rounded-md' />
          <div className='skeleton h-8 w-20 rounded-md' />
        </div>
      </div>

      <div className='space-y-4'>
        <div className='skeleton ml-4 h-5 w-20' />
        {Array.from({ length: SKELETON_LOADING_COUNT }).map((_, index) => (
          <CommentItemSkeleton key={index} />
        ))}
      </div>
    </FormPageSkeleton>
  );
}
