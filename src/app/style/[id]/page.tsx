import { StyleForm } from '@/app/style/_components';
import { FormSkeleton } from '@/components/loading';
import { Suspense } from 'react';

export default function StyleSavePage() {
  return (
    <Suspense fallback={<FormSkeleton />}>
      <StyleForm />
    </Suspense>
  );
}
