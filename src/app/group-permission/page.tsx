'use client';

import { GroupTab } from '@/app/group-permission/_components';
import { ListPageSkeleton } from '@/components/loading';
import { Suspense } from 'react';

export default function GroupPermissionPage() {
  return (
    <Suspense fallback={<ListPageSkeleton />}>
      <GroupTab />
    </Suspense>
  );
}
