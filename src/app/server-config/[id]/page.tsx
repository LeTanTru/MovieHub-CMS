import { ServerConfigForm } from '@/app/server-config/_components';
import { FormSkeleton } from '@/components/loading';
import { Suspense } from 'react';

export default function StyleSavePage() {
  return (
    <Suspense fallback={<FormSkeleton />}>
      <ServerConfigForm />
    </Suspense>
  );
}
