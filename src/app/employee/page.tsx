import { EmployeeList } from '@/app/employee/_components';
import { ListPageSkeleton } from '@/components/loading';
import type { Metadata } from 'next';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'Nhân viên'
};

export default function EmployeeListPage() {
  return (
    <Suspense fallback={<ListPageSkeleton />}>
      <EmployeeList />
    </Suspense>
  );
}
