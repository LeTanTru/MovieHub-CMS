import { MoviePersonTab } from '@/app/movie/[id]/movie-person/_components';
import { ListPageSkeleton } from '@/components/loading';
import type { Metadata } from 'next';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'Diễn viên & đạo diễn'
};

export default function MovieLPersonListPage() {
  return (
    <Suspense fallback={<ListPageSkeleton />}>
      <MoviePersonTab />
    </Suspense>
  );
}
