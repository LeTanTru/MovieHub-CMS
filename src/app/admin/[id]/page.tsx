import { AdminForm } from '@/app/admin/_components';
import { FormSkeleton } from '@/components/loading';
import { Suspense } from 'react';

export default function AdminSavePage() {
  return (
    <Suspense fallback={<FormSkeleton />}>
      <AdminForm />
    </Suspense>
  );
}
