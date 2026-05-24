'use client';

import dynamic from 'next/dynamic';

const Overview = dynamic(
  () =>
    import('@/app/statistics/overview/_components').then((mod) => mod.Overview),
  { ssr: false }
);

export default function OverviewPage() {
  return <Overview />;
}
