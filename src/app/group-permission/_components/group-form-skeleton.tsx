'use client';

import { FormPageSkeleton } from '@/components/loading/form-page-skeleton';
import { Skeleton } from '@/components/ui/skeleton';

export function GroupFormSkeleton() {
  return (
    <FormPageSkeleton>
      {/* name / kind */}
      <FormPageSkeleton.Row>
        <FormPageSkeleton.Col span={6}>
          <FormPageSkeleton.Field labelWidth='w-24' />
        </FormPageSkeleton.Col>
        <FormPageSkeleton.Col span={6}>
          <FormPageSkeleton.Field labelWidth='w-24' />
        </FormPageSkeleton.Col>
      </FormPageSkeleton.Row>
      {/* color picker */}
      <FormPageSkeleton.Row>
        <FormPageSkeleton.Col span={12}>
          <FormPageSkeleton.Field labelWidth='w-16' />
        </FormPageSkeleton.Col>
      </FormPageSkeleton.Row>
      {/* description textarea */}
      <FormPageSkeleton.Row>
        <FormPageSkeleton.Col span={12}>
          <FormPageSkeleton.Field labelWidth='w-16' height='h-24' />
        </FormPageSkeleton.Col>
      </FormPageSkeleton.Row>
      {/* Permission card matrix */}
      <FormPageSkeleton.Row>
        <FormPageSkeleton.Col span={12}>
          <div className='flex flex-col gap-4'>
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className='rounded-lg border'>
                <div className='flex items-center gap-2 border-b px-4 py-2'>
                  <FormPageSkeleton.Checkbox width='size-4' />
                  <Skeleton className='h-4 w-32' />
                </div>
                <div className='grid grid-cols-4 gap-4 p-4'>
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((j) => (
                    <div key={j} className='flex flex-col gap-1'>
                      <div className='flex items-center gap-2'>
                        <FormPageSkeleton.Checkbox width='size-4' />
                        <Skeleton className='h-4 w-20' />
                      </div>
                      <Skeleton className='ml-6 h-3 w-16' />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </FormPageSkeleton.Col>
      </FormPageSkeleton.Row>
      <FormPageSkeleton.Actions />
    </FormPageSkeleton>
  );
}
