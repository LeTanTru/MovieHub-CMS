import { CollectionItemList } from '@/app/collection/[id]/collection-item/_components';
import { ListPageSkeleton } from '@/components/loading';
import type { Metadata } from 'next';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'Phim'
};

export default function CollectionItemListPage() {
  return (
    <Suspense fallback={<ListPageSkeleton />}>
      <CollectionItemList />
    </Suspense>
  );
}
