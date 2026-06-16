'use client';

import { FormPageSkeleton } from '@/components/loading/form-page-skeleton';

export function StyleFormSkeleton() {
  return (
    <FormPageSkeleton>
      {/* Two image upload panels */}
      <FormPageSkeleton.Row>
        <FormPageSkeleton.Col span={6}>
          <FormPageSkeleton.ImageUpload
            labelWidth='w-28'
            previewClassName='h-[150px] w-[100px] rounded-lg'
          />
        </FormPageSkeleton.Col>
        <FormPageSkeleton.Col span={6}>
          <FormPageSkeleton.ImageUpload
            labelWidth='w-24'
            previewClassName='h-[150px] w-[267px] rounded-lg'
          />
        </FormPageSkeleton.Col>
      </FormPageSkeleton.Row>
      {/* name / type */}
      <FormPageSkeleton.Row>
        <FormPageSkeleton.Col span={6}>
          <FormPageSkeleton.Field labelWidth='w-28' />
        </FormPageSkeleton.Col>
        <FormPageSkeleton.Col span={6}>
          <FormPageSkeleton.Field labelWidth='w-16' />
        </FormPageSkeleton.Col>
      </FormPageSkeleton.Row>
      {/* isDefault checkbox */}
      <FormPageSkeleton.Row>
        <FormPageSkeleton.Col span={6}>
          <FormPageSkeleton.Checkbox width='w-20' />
        </FormPageSkeleton.Col>
      </FormPageSkeleton.Row>
      {/* Description rich text */}
      <FormPageSkeleton.Row>
        <FormPageSkeleton.Col span={12}>
          <FormPageSkeleton.RichText labelWidth='w-16' />
        </FormPageSkeleton.Col>
      </FormPageSkeleton.Row>
      <FormPageSkeleton.Actions />
    </FormPageSkeleton>
  );
}
