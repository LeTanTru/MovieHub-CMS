import { PersonTab } from '@/app/person/_components';
import { ListPageSkeleton } from '@/components/loading';
import type { Metadata } from 'next';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'Diễn viên & Đạo diễn'
};

export default function PersonListPage() {
  return (
    <Suspense fallback={<ListPageSkeleton />}>
      <PersonTab />
    </Suspense>
  );
}
