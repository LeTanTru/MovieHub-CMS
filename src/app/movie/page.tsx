import { MovieList } from '@/app/movie/_components';
import { ListPageSkeleton } from '@/components/loading';
import type { Metadata } from 'next';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'Phim'
};

export default function MovieListPage() {
  return (
    <Suspense fallback={<ListPageSkeleton />}>
      <MovieList />
    </Suspense>
  );
}
