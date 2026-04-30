import { AppVersionForm } from '@/app/app-version/_components';
import { FormSkeleton } from '@/components/loading';
import { Suspense } from 'react';

export default function AppVersionSavePage() {
  return (
    <Suspense fallback={<FormSkeleton />}>
      <AppVersionForm />
    </Suspense>
  );
}
