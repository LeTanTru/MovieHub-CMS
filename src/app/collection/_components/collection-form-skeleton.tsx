'use client';

import { FormPageSkeleton } from '@/components/loading/form-page-skeleton';
import { Skeleton } from '@/components/ui/skeleton';

export function CollectionFormSkeleton() {
  return (
    <FormPageSkeleton>
      {/* name / type */}
      <FormPageSkeleton.Row>
        <FormPageSkeleton.Col span={6}>
          <FormPageSkeleton.Field labelWidth='w-32' />
        </FormPageSkeleton.Col>
        <FormPageSkeleton.Col span={6}>
          <FormPageSkeleton.Field labelWidth='w-16' />
        </FormPageSkeleton.Col>
      </FormPageSkeleton.Row>
      {/* Color list + style selector */}
      <FormPageSkeleton.Row>
        <FormPageSkeleton.Col span={6}>
          <div className='flex flex-col gap-2'>
            <Skeleton className='h-4 w-32' />
            <div className='space-y-2'>
              <Skeleton className='h-10 w-full rounded' />
              <Skeleton className='h-10 w-full rounded' />
              <Skeleton className='h-8 w-full rounded' />
            </div>
          </div>
        </FormPageSkeleton.Col>
        <FormPageSkeleton.Col span={6}>
          <FormPageSkeleton.Field labelWidth='w-24' />
        </FormPageSkeleton.Col>
      </FormPageSkeleton.Row>
      {/* fillData checkbox */}
      <FormPageSkeleton.Row>
        <FormPageSkeleton.Col span={6}>
          <FormPageSkeleton.Checkbox width='w-40' />
        </FormPageSkeleton.Col>
      </FormPageSkeleton.Row>
      {/* Filter FieldSet */}
      <FormPageSkeleton.Section titleWidth='w-20'>
        {/* type / ageRating */}
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
        {/* categories / limit */}
        <FormPageSkeleton.Row>
          <FormPageSkeleton.Col span={6}>
            <FormPageSkeleton.Field labelWidth='w-24' />
          </FormPageSkeleton.Col>
          <FormPageSkeleton.Col span={6}>
            <FormPageSkeleton.Field labelWidth='w-24' />
          </FormPageSkeleton.Col>
        </FormPageSkeleton.Row>
        {/* checkbox flags row */}
        <FormPageSkeleton.Row>
          <FormPageSkeleton.Col span={3}>
            <FormPageSkeleton.Checkbox width='w-12' />
          </FormPageSkeleton.Col>
          <FormPageSkeleton.Col span={3}>
            <FormPageSkeleton.Checkbox width='w-24' />
          </FormPageSkeleton.Col>
          <FormPageSkeleton.Col span={3}>
            <FormPageSkeleton.Checkbox width='w-20' />
          </FormPageSkeleton.Col>
        </FormPageSkeleton.Row>
        {/* Reset button */}
        <div className='mt-4 flex justify-end'>
          <Skeleton className='h-9 w-32' />
        </div>
      </FormPageSkeleton.Section>
      <FormPageSkeleton.Actions />
    </FormPageSkeleton>
  );
}
