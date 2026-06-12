'use client';

import dynamic from 'next/dynamic';

const Overview = dynamic(
  () => import('./_components/overview').then((mod) => mod.Overview),
  { ssr: false }
);

export function OverviewClient() {
  return <Overview />;
}
