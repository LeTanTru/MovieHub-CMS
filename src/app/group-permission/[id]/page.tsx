import { GroupForm } from '@/app/group-permission/_components';
import { FormSkeleton } from '@/components/loading';
import { Suspense } from 'react';

export default function GroupDetailPage() {
  return (
    <Suspense fallback={<FormSkeleton />}>
      <GroupForm />
    </Suspense>
  );
}
