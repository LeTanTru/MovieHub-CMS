'use client';

import dynamic from 'next/dynamic';

const MovieDistribution = dynamic(
  () =>
    import('./_components/movie-distribution').then(
      (mod) => mod.MovieDistribution
    ),
  { ssr: false }
);

export function MovieDistributionClient() {
  return <MovieDistribution />;
}
