import { SettingTab } from '@/app/setting/_components';
import { ListPageSkeleton } from '@/components/loading';
import type { Metadata } from 'next';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'Cài đặt'
};

export default function SettingPage() {
  return (
    <Suspense fallback={<ListPageSkeleton />}>
      <SettingTab />
    </Suspense>
  );
}
