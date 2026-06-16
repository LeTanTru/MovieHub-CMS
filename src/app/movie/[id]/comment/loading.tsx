import { FormPageSkeleton } from '@/components/loading/form-page-skeleton';
import { CommentItem } from '@/app/movie/[id]/comment/_components';
import { SKELETON_LOADING_COUNT } from '@/constants';

export default function Loading() {
  return (
    <FormPageSkeleton breadcrumbLevel={3}>
      <div className='space-y-4 px-4'>
        <div className='skeleton ml-4 h-5 w-20' />
        {Array.from({ length: SKELETON_LOADING_COUNT }).map((_, index) => (
          <CommentItem.Skeleton key={index} />
        ))}
      </div>
    </FormPageSkeleton>
  );
}
