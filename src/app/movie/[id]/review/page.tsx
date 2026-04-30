import { ReviewList } from '@/app/movie/[id]/review/_components';
import { ListPageSkeleton } from '@/components/loading';
import type { Metadata } from 'next';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'Đánh giá'
};

export default function ReviewListPage() {
  return (
    <Suspense fallback={<ListPageSkeleton />}>
      <ReviewList />
    </Suspense>
  );
}
