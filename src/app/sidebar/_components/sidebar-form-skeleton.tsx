'use client';

import { FormPageSkeleton } from '@/components/loading/form-page-skeleton';

export function SidebarFormSkeleton() {
  return (
    <FormPageSkeleton>
      {/* Two image upload panels side by side */}
      <FormPageSkeleton.Row>
        <FormPageSkeleton.Col span={6}>
          <FormPageSkeleton.ImageUpload
            labelWidth='w-36'
            previewClassName='h-[150px] w-[267px] rounded-lg'
          />
        </FormPageSkeleton.Col>
        <FormPageSkeleton.Col span={6}>
          <FormPageSkeleton.ImageUpload
            labelWidth='w-36'
            previewClassName='h-[150px] w-[100px] rounded-lg'
          />
        </FormPageSkeleton.Col>
      </FormPageSkeleton.Row>
      {/* Movie autocomplete + color picker */}
      <FormPageSkeleton.Row>
        <FormPageSkeleton.Col span={6}>
          <FormPageSkeleton.Field labelWidth='w-24' />
        </FormPageSkeleton.Col>
        <FormPageSkeleton.Col span={6}>
          <FormPageSkeleton.Field labelWidth='w-24' />
        </FormPageSkeleton.Col>
      </FormPageSkeleton.Row>
      {/* Checkbox row */}
      <FormPageSkeleton.Row>
        <FormPageSkeleton.Col span={6}>
          <FormPageSkeleton.Checkbox width='w-20' />
        </FormPageSkeleton.Col>
      </FormPageSkeleton.Row>
      {/* Rich text block */}
      <FormPageSkeleton.Row>
        <FormPageSkeleton.Col span={12}>
          <FormPageSkeleton.RichText labelWidth='w-24' />
        </FormPageSkeleton.Col>
      </FormPageSkeleton.Row>
      <FormPageSkeleton.Actions />
    </FormPageSkeleton>
  );
}
