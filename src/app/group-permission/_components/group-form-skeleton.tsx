'use client';

import { Col, Row } from '@/components/form';
import { FormPageSkeleton } from '@/components/loading/form-page-skeleton';
import { Skeleton } from '@/components/ui/skeleton';

export function GroupFormSkeleton() {
  return (
    <FormPageSkeleton>
      {/* name / kind */}
      <Row>
        <Col className='grid-c-6'>
          <Skeleton className='mb-2 h-4 w-24' />
          <Skeleton className='h-10 w-full' />
        </Col>
        <Col className='grid-c-6'>
          <Skeleton className='mb-2 h-4 w-24' />
          <Skeleton className='h-10 w-full' />
        </Col>
      </Row>
      {/* color picker */}
      <Row>
        <Col className='grid-c-12'>
          <Skeleton className='mb-2 h-4 w-16' />
          <Skeleton className='h-10 w-full' />
        </Col>
      </Row>
      {/* description textarea */}
      <Row>
        <Col className='grid-c-12'>
          <Skeleton className='mb-2 h-4 w-16' />
          <Skeleton className='h-24 w-full rounded-lg' />
        </Col>
      </Row>
      {/* Permission card matrix */}
      <Row>
        <Col className='grid-c-12'>
          <div className='flex flex-col gap-4'>
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className='rounded-lg border'>
                <div className='flex items-center gap-2 border-b px-4 py-2'>
                  <Skeleton className='size-4 rounded' />
                  <Skeleton className='h-4 w-32' />
                </div>
                <div className='grid grid-cols-4 gap-4 p-4'>
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((j) => (
                    <div key={j} className='flex flex-col gap-1'>
                      <div className='flex items-center gap-2'>
                        <Skeleton className='size-4 rounded' />
                        <Skeleton className='h-4 w-20' />
                      </div>
                      <Skeleton className='ml-6 h-3 w-16' />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Col>
      </Row>
      <div className='mt-6 flex justify-end gap-3'>
        <Skeleton className='h-10 w-24' />
        <Skeleton className='h-10 w-24' />
      </div>
    </FormPageSkeleton>
  );
}
