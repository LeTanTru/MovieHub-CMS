'use client';

import { FormPageSkeleton } from '@/components/loading/form-page-skeleton';

export function ProfileFormSkeleton() {
  return (
    <FormPageSkeleton breadcrumbLevel={2} panelClassName='mx-auto w-1/2'>
      {/* Avatar upload */}
      <FormPageSkeleton.Row>
        <FormPageSkeleton.Col span={12}>
          <FormPageSkeleton.ImageUpload
            labelWidth='w-24'
            previewClassName='size-[120px] rounded-full'
          />
        </FormPageSkeleton.Col>
      </FormPageSkeleton.Row>
      {/* Full name */}
      <FormPageSkeleton.Row>
        <FormPageSkeleton.Col span={12}>
          <FormPageSkeleton.Field labelWidth='w-24' />
        </FormPageSkeleton.Col>
      </FormPageSkeleton.Row>
      {/* Old password */}
      <FormPageSkeleton.Row>
        <FormPageSkeleton.Col span={12}>
          <FormPageSkeleton.Field labelWidth='w-32' />
        </FormPageSkeleton.Col>
      </FormPageSkeleton.Row>
      {/* New password */}
      <FormPageSkeleton.Row>
        <FormPageSkeleton.Col span={12}>
          <FormPageSkeleton.Field labelWidth='w-28' />
        </FormPageSkeleton.Col>
      </FormPageSkeleton.Row>
      {/* Confirm password */}
      <FormPageSkeleton.Row>
        <FormPageSkeleton.Col span={12}>
          <FormPageSkeleton.Field labelWidth='w-36' />
        </FormPageSkeleton.Col>
      </FormPageSkeleton.Row>
      <FormPageSkeleton.Actions />
    </FormPageSkeleton>
  );
}
