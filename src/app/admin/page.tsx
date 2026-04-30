import { AdminList } from '@/app/admin/_components';
import { ListPageSkeleton } from '@/components/loading';
import type { Metadata } from 'next';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'Quản trị viên'
};

export default function AdminPage() {
  return (
    <Suspense fallback={<ListPageSkeleton />}>
      <AdminList />
    </Suspense>
  );
}
