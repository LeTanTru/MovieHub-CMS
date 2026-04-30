import { MovieForm } from '@/app/movie/_components';
import { FormSkeleton } from '@/components/loading';
import type { Metadata } from 'next';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'Phim'
};

export default function MovieSavePage() {
  return (
    <Suspense fallback={<FormSkeleton />}>
      <MovieForm />
    </Suspense>
  );
}
