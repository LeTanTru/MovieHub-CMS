import { CategoryList } from '@/app/category/_components';
import { ListPageSkeleton } from '@/components/loading';
import type { Metadata } from 'next';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'Thể loại'
};

export default function CategoryListPage() {
  return (
    <Suspense fallback={<ListPageSkeleton />}>
      <CategoryList />
    </Suspense>
  );
}
