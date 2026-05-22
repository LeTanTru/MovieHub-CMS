'use client';

import dynamic from 'next/dynamic';

const TopMovies = dynamic(
  () =>
    import('@/app/statistics/top-movies/_components').then(
      (mod) => mod.TopMovies
    ),
  { ssr: false }
);

export default function TopMoviesPage() {
  return <TopMovies />;
}
