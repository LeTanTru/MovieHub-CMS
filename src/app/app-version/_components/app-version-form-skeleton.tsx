'use client';

import { Col, Row } from '@/components/form';
import { FormPageSkeleton } from '@/components/loading/form-page-skeleton';
import { Skeleton } from '@/components/ui/skeleton';

export function AppVersionFormSkeleton() {
  return (
    <FormPageSkeleton>
      {/* APK upload panel */}
      <Row>
        <Col className='grid-c-12'>
          <Skeleton className='mb-2 h-4 w-32' />
          <Skeleton className='h-[100px] w-full rounded-lg' />
        </Col>
      </Row>
      {/* version name / code */}
      <Row>
        <Col className='grid-c-6'>
          <Skeleton className='mb-2 h-4 w-28' />
          <Skeleton className='h-10 w-full' />
        </Col>
        <Col className='grid-c-6'>
          <Skeleton className='mb-2 h-4 w-24' />
          <Skeleton className='h-10 w-full' />
        </Col>
      </Row>
      {/* changeLog / checkboxes */}
      <Row>
        <Col className='grid-c-6'>
          <Skeleton className='mb-2 h-4 w-28' />
          <Skeleton className='h-10 w-full' />
        </Col>
        <Col className='grid-c-6'>
          <div className='flex gap-4 pt-6'>
            <Skeleton className='h-5 w-28' />
            <Skeleton className='h-5 w-32' />
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
