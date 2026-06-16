'use client';

import { FormPageSkeleton } from '@/components/loading/form-page-skeleton';

export function VideoLibraryFormSkeleton() {
  return (
    <FormPageSkeleton>
      {/* Thumbnail upload */}
      <FormPageSkeleton.Row>
        <FormPageSkeleton.Col span={12}>
          <FormPageSkeleton.ImageUpload
            labelWidth='w-28'
            previewClassName='h-[150px] w-[267px] rounded-lg'
          />
        </FormPageSkeleton.Col>
      </FormPageSkeleton.Row>
      {/* name / sourceType */}
      <FormPageSkeleton.Row>
        <FormPageSkeleton.Col span={6}>
          <FormPageSkeleton.Field labelWidth='w-24' />
        </FormPageSkeleton.Col>
        <FormPageSkeleton.Col span={6}>
          <FormPageSkeleton.Field labelWidth='w-28' />
        </FormPageSkeleton.Col>
      </FormPageSkeleton.Row>
      {/* introStart / introEnd */}
      <FormPageSkeleton.Row>
        <FormPageSkeleton.Col span={6}>
          <FormPageSkeleton.Field labelWidth='w-36' />
        </FormPageSkeleton.Col>
        <FormPageSkeleton.Col span={6}>
          <FormPageSkeleton.Field labelWidth='w-36' />
        </FormPageSkeleton.Col>
      </FormPageSkeleton.Row>
      {/* outroStart */}
      <FormPageSkeleton.Row>
        <FormPageSkeleton.Col span={6}>
          <FormPageSkeleton.Field labelWidth='w-36' />
        </FormPageSkeleton.Col>
      </FormPageSkeleton.Row>
      {/* Video upload area */}
      <FormPageSkeleton.Row>
        <FormPageSkeleton.Col span={12}>
          <FormPageSkeleton.Field labelWidth='w-16' height='h-[200px]' />
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
