import { StyleList } from '@/app/style/_components';
import { ListPageSkeleton } from '@/components/loading';
import type { Metadata } from 'next';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'Thiết kế'
};

export default function StyleListPage() {
  return (
    <Suspense fallback={<ListPageSkeleton />}>
      <StyleList />
    </Suspense>
  );
}
