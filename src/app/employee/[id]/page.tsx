import { EmployeeForm } from '@/app/employee/_components';
import { FormSkeleton } from '@/components/loading';
import { Suspense } from 'react';

export default function EmployeeSavePage() {
  return (
    <Suspense fallback={<FormSkeleton />}>
      <EmployeeForm />
    </Suspense>
  );
}
