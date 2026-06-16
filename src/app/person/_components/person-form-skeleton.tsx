'use client';

import { FormPageSkeleton } from '@/components/loading/form-page-skeleton';

export function PersonFormSkeleton() {
  return (
    <FormPageSkeleton>
      {/* Avatar */}
      <FormPageSkeleton.Row>
        <FormPageSkeleton.Col span={12}>
          <FormPageSkeleton.ImageUpload
            labelWidth='w-24'
            previewClassName='size-[120px] rounded-full'
          />
        </FormPageSkeleton.Col>
      </FormPageSkeleton.Row>
      {/* name / otherName */}
      <FormPageSkeleton.Row>
        <FormPageSkeleton.Col span={6}>
          <FormPageSkeleton.Field labelWidth='w-24' />
        </FormPageSkeleton.Col>
        <FormPageSkeleton.Col span={6}>
          <FormPageSkeleton.Field labelWidth='w-24' />
        </FormPageSkeleton.Col>
      </FormPageSkeleton.Row>
      {/* dateOfBirth / gender */}
      <FormPageSkeleton.Row>
        <FormPageSkeleton.Col span={6}>
          <FormPageSkeleton.Field labelWidth='w-24' />
        </FormPageSkeleton.Col>
        <FormPageSkeleton.Col span={6}>
          <FormPageSkeleton.Field labelWidth='w-24' />
        </FormPageSkeleton.Col>
      </FormPageSkeleton.Row>
      {/* kinds / country */}
      <FormPageSkeleton.Row>
        <FormPageSkeleton.Col span={6}>
          <FormPageSkeleton.Field labelWidth='w-24' />
        </FormPageSkeleton.Col>
        <FormPageSkeleton.Col span={6}>
          <FormPageSkeleton.Field labelWidth='w-24' />
        </FormPageSkeleton.Col>
      </FormPageSkeleton.Row>
      {/* Biography rich text */}
      <FormPageSkeleton.Row>
        <FormPageSkeleton.Col span={12}>
          <FormPageSkeleton.RichText labelWidth='w-24' />
        </FormPageSkeleton.Col>
      </FormPageSkeleton.Row>
      <FormPageSkeleton.Actions />
    </FormPageSkeleton>
  );
}
