import { CollectionList } from '@/app/collection/_components';
import { ListPageSkeleton } from '@/components/loading';
import type { Metadata } from 'next';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'Bộ sưu tập'
};

export default function CollectionListPage() {
  return (
    <Suspense fallback={<ListPageSkeleton />}>
      <CollectionList />
    </Suspense>
  );
}
