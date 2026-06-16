'use client';

import { FormPageSkeleton } from '@/components/loading/form-page-skeleton';

export function MovieFormSkeleton() {
  return (
    <FormPageSkeleton>
      {/* Three upload panels */}
      <FormPageSkeleton.Row>
        <FormPageSkeleton.Col span={4}>
          <FormPageSkeleton.ImageUpload
            labelWidth='w-32'
            previewClassName='h-[150px] w-[100px] rounded-lg'
          />
        </FormPageSkeleton.Col>
        <FormPageSkeleton.Col span={4}>
          <FormPageSkeleton.ImageUpload
            labelWidth='w-40'
            previewClassName='h-[150px] w-[267px] rounded-lg'
          />
        </FormPageSkeleton.Col>
        <FormPageSkeleton.Col span={4}>
          <FormPageSkeleton.ImageUpload
            labelWidth='w-36'
            previewClassName='size-[150px] rounded-lg'
          />
        </FormPageSkeleton.Col>
      </FormPageSkeleton.Row>
      {/* title / originalTitle */}
      <FormPageSkeleton.Row>
        <FormPageSkeleton.Col span={6}>
          <FormPageSkeleton.Field labelWidth='w-24' />
        </FormPageSkeleton.Col>
        <FormPageSkeleton.Col span={6}>
          <FormPageSkeleton.Field labelWidth='w-24' />
        </FormPageSkeleton.Col>
      </FormPageSkeleton.Row>
      {/* country / language */}
      <FormPageSkeleton.Row>
        <FormPageSkeleton.Col span={6}>
          <FormPageSkeleton.Field labelWidth='w-24' />
        </FormPageSkeleton.Col>
        <FormPageSkeleton.Col span={6}>
          <FormPageSkeleton.Field labelWidth='w-24' />
        </FormPageSkeleton.Col>
      </FormPageSkeleton.Row>
      {/* ageRating / type */}
      <FormPageSkeleton.Row>
        <FormPageSkeleton.Col span={6}>
          <FormPageSkeleton.Field labelWidth='w-24' />
        </FormPageSkeleton.Col>
        <FormPageSkeleton.Col span={6}>
          <FormPageSkeleton.Field labelWidth='w-24' />
        </FormPageSkeleton.Col>
      </FormPageSkeleton.Row>
      {/* releaseDate / categories */}
      <FormPageSkeleton.Row>
        <FormPageSkeleton.Col span={6}>
          <FormPageSkeleton.Field labelWidth='w-28' />
        </FormPageSkeleton.Col>
        <FormPageSkeleton.Col span={6}>
          <FormPageSkeleton.Field labelWidth='w-24' />
        </FormPageSkeleton.Col>
      </FormPageSkeleton.Row>
      {/* year / imdbId */}
      <FormPageSkeleton.Row>
        <FormPageSkeleton.Col span={6}>
          <FormPageSkeleton.Field labelWidth='w-32' />
        </FormPageSkeleton.Col>
        <FormPageSkeleton.Col span={6}>
          <FormPageSkeleton.Field labelWidth='w-24' />
        </FormPageSkeleton.Col>
      </FormPageSkeleton.Row>
      {/* status */}
      <FormPageSkeleton.Row>
        <FormPageSkeleton.Col span={6}>
          <FormPageSkeleton.Field labelWidth='w-24' />
        </FormPageSkeleton.Col>
      </FormPageSkeleton.Row>
      {/* isFeatured checkbox */}
      <FormPageSkeleton.Row>
        <FormPageSkeleton.Col span={3}>
          <FormPageSkeleton.Checkbox width='w-12' />
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
