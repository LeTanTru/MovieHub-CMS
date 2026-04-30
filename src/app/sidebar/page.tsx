import { SidebarList } from '@/app/sidebar/_components';
import { ListPageSkeleton } from '@/components/loading';
import type { Metadata } from 'next';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'Phim hot'
};

export default function PersonListPage() {
  return (
    <Suspense fallback={<ListPageSkeleton />}>
      <SidebarList />
    </Suspense>
  );
}
