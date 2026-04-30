import { CommentList } from '@/app/movie/[id]/comment/_components';
import { ListPageSkeleton } from '@/components/loading';
import type { Metadata } from 'next';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'Bình luận'
};

export default function CommentListPage() {
  return (
    <Suspense fallback={<ListPageSkeleton />}>
      <CommentList />
    </Suspense>
  );
}
