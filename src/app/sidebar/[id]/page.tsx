import { SidebarForm } from '@/app/sidebar/_components';
import { FormSkeleton } from '@/components/loading';
import type { Metadata } from 'next';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'Phim hot'
};

export default function SidebarSavePage() {
  return (
    <Suspense fallback={<FormSkeleton />}>
      <SidebarForm />
    </Suspense>
  );
}
