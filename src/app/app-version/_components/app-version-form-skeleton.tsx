'use client';

import { FormPageSkeleton } from '@/components/loading/form-page-skeleton';

export function AppVersionFormSkeleton() {
  return (
    <FormPageSkeleton>
      {/* APK upload panel */}
      <FormPageSkeleton.Row>
        <FormPageSkeleton.Col span={12}>
          <FormPageSkeleton.Field labelWidth='w-32' height='h-[100px]' />
        </FormPageSkeleton.Col>
      </FormPageSkeleton.Row>
      {/* version name / code */}
      <FormPageSkeleton.Row>
        <FormPageSkeleton.Col span={6}>
          <FormPageSkeleton.Field labelWidth='w-28' />
        </FormPageSkeleton.Col>
        <FormPageSkeleton.Col span={6}>
          <FormPageSkeleton.Field labelWidth='w-24' />
        </FormPageSkeleton.Col>
      </FormPageSkeleton.Row>
      {/* changeLog / checkboxes */}
      <FormPageSkeleton.Row>
        <FormPageSkeleton.Col span={6}>
          <FormPageSkeleton.Field labelWidth='w-28' />
        </FormPageSkeleton.Col>
        <FormPageSkeleton.Col span={6}>
          <div className='flex gap-4 pt-6'>
            <FormPageSkeleton.Checkbox width='w-28' />
            <FormPageSkeleton.Checkbox width='w-32' />
          </div>
        </FormPageSkeleton.Col>
      </FormPageSkeleton.Row>
      <FormPageSkeleton.Actions />
    </FormPageSkeleton>
  );
}
