'use client';

import dynamic from 'next/dynamic';

const TopMovies = dynamic(
  () => import('./_components/top-movies').then((mod) => mod.TopMovies),
  { ssr: false }
);

export function TopMoviesClient() {
  return <TopMovies />;
}
