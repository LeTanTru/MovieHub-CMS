import { MovieItemSeasonList } from '@/app/movie/[id]/movie-item/_components';
import { ListPageSkeleton } from '@/components/loading';
import type { Metadata } from 'next';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'Phần'
};

export default function MovieItemListPage() {
  return (
    <Suspense fallback={<ListPageSkeleton />}>
      <MovieItemSeasonList />
    </Suspense>
  );
}
