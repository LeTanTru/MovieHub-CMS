import { AppVersionList } from '@/app/app-version/_components';
import { ListPageSkeleton } from '@/components/loading';
import type { Metadata } from 'next';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'Phiên bản ứng dụng'
};

export default function AppVersionListPage() {
  return (
    <Suspense fallback={<ListPageSkeleton />}>
      <AppVersionList />
    </Suspense>
  );
}
