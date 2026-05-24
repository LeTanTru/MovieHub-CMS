'use client';

import dynamic from 'next/dynamic';

const MovieDistribution = dynamic(
  () =>
    import('@/app/statistics/movie-distribution/_components').then(
      (mod) => mod.MovieDistribution
    ),
  { ssr: false }
);

export default function MovieDistributionPage() {
  return <MovieDistribution />;
}
