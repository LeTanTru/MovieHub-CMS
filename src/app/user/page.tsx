import { UserList } from '@/app/user/_components';
import { ListPageSkeleton } from '@/components/loading';
import type { Metadata } from 'next';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'Người dùng'
};

export default function UserListPage() {
  return (
    <Suspense fallback={<ListPageSkeleton />}>
      <UserList />
    </Suspense>
  );
}
