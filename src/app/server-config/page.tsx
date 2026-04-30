import { ServerConfigList } from '@/app/server-config/_components';
import { ListPageSkeleton } from '@/components/loading';
import type { Metadata } from 'next';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'Cấu hình server'
};

export default function ServerConfigListPage() {
  return (
    <Suspense fallback={<ListPageSkeleton />}>
      <ServerConfigList />
    </Suspense>
  );
}
