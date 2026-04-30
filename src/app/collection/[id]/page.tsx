import { CollectionForm } from '@/app/collection/_components';
import { FormSkeleton } from '@/components/loading';
import { Suspense } from 'react';

export default function CollectionSavePage() {
  return (
    <Suspense fallback={<FormSkeleton />}>
      <CollectionForm />
    </Suspense>
  );
}
