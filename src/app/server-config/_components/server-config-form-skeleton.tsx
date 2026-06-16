'use client';

import { FormPageSkeleton } from '@/components/loading/form-page-skeleton';

export function ServerConfigFormSkeleton() {
  return (
    <FormPageSkeleton>
      <FormPageSkeleton.Row>
        <FormPageSkeleton.Col span={6}>
          <FormPageSkeleton.Field labelWidth='w-24' />
        </FormPageSkeleton.Col>
        <FormPageSkeleton.Col span={6}>
          <FormPageSkeleton.Field labelWidth='w-24' />
        </FormPageSkeleton.Col>
      </FormPageSkeleton.Row>
      <FormPageSkeleton.Row>
        <FormPageSkeleton.Col span={6}>
          <FormPageSkeleton.Field labelWidth='w-24' />
        </FormPageSkeleton.Col>
        <FormPageSkeleton.Col span={6}>
          <FormPageSkeleton.Field labelWidth='w-24' />
        </FormPageSkeleton.Col>
      </FormPageSkeleton.Row>
      <FormPageSkeleton.Row>
        <FormPageSkeleton.Col span={6}>
          <FormPageSkeleton.Field labelWidth='w-24' />
        </FormPageSkeleton.Col>
        <FormPageSkeleton.Col span={6}>
          <FormPageSkeleton.Field labelWidth='w-24' />
        </FormPageSkeleton.Col>
      </FormPageSkeleton.Row>
      <FormPageSkeleton.Actions />
    </FormPageSkeleton>
  );
}
