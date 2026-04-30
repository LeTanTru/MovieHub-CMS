import { PersonForm } from '@/app/person/_components';
import { FormSkeleton } from '@/components/loading';
import type { Metadata } from 'next';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'Diễn viên & Đạo diễn'
};

export default function PersonSavePage() {
  return (
    <Suspense fallback={<FormSkeleton />}>
      <PersonForm />
    </Suspense>
  );
}
