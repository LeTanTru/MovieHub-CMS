'use client';

import { FormPageSkeleton } from '@/components/loading/form-page-skeleton';

export function AdminFormSkeleton() {
  return (
    <FormPageSkeleton>
      {/* Avatar upload */}
      <FormPageSkeleton.Row>
        <FormPageSkeleton.Col span={12}>
          <FormPageSkeleton.ImageUpload
            labelWidth='w-24'
            previewClassName='size-[120px] rounded-full'
          />
        </FormPageSkeleton.Col>
      </FormPageSkeleton.Row>
      {/* username / fullName */}
      <FormPageSkeleton.Row>
        <FormPageSkeleton.Col span={6}>
          <FormPageSkeleton.Field labelWidth='w-28' />
        </FormPageSkeleton.Col>
        <FormPageSkeleton.Col span={6}>
          <FormPageSkeleton.Field labelWidth='w-24' />
        </FormPageSkeleton.Col>
      </FormPageSkeleton.Row>
      {/* email / phone */}
      <FormPageSkeleton.Row>
        <FormPageSkeleton.Col span={6}>
          <FormPageSkeleton.Field labelWidth='w-24' />
        </FormPageSkeleton.Col>
        <FormPageSkeleton.Col span={6}>
          <FormPageSkeleton.Field labelWidth='w-32' />
        </FormPageSkeleton.Col>
      </FormPageSkeleton.Row>
      {/* password / confirmPassword */}
      <FormPageSkeleton.Row>
        <FormPageSkeleton.Col span={6}>
          <FormPageSkeleton.Field labelWidth='w-20' />
        </FormPageSkeleton.Col>
        <FormPageSkeleton.Col span={6}>
          <FormPageSkeleton.Field labelWidth='w-32' />
        </FormPageSkeleton.Col>
      </FormPageSkeleton.Row>
      {/* role / status */}
      <FormPageSkeleton.Row>
        <FormPageSkeleton.Col span={6}>
          <FormPageSkeleton.Field labelWidth='w-24' />
        </FormPageSkeleton.Col>
        <FormPageSkeleton.Col span={6}>
          <FormPageSkeleton.Field labelWidth='w-28' />
        </FormPageSkeleton.Col>
      </FormPageSkeleton.Row>
      <FormPageSkeleton.Actions />
    </FormPageSkeleton>
  );
}
