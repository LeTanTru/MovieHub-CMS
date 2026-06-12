'use client';

import { Col, Row } from '@/components/form';
import { FormImageUploadSkeleton } from '@/components/loading/form-image-upload-skeleton';
import { FormPageSkeleton } from '@/components/loading/form-page-skeleton';
import { Skeleton } from '@/components/ui/skeleton';

export function AdminFormSkeleton() {
  return (
    <FormPageSkeleton>
      {/* Avatar upload */}
      <Row>
        <Col className='grid-c-12'>
          <FormImageUploadSkeleton
            labelClassName='w-24'
            previewClassName='size-[120px] rounded-full'
          />
        </Col>
      </Row>
      {/* username / fullName */}
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
      {/* email / phone */}
      <Row>
        <Col className='grid-c-6'>
          <Skeleton className='mb-2 h-4 w-24' />
          <Skeleton className='h-10 w-full' />
        </Col>
        <Col className='grid-c-6'>
          <Skeleton className='mb-2 h-4 w-32' />
          <Skeleton className='h-10 w-full' />
        </Col>
      </Row>
      {/* password / confirmPassword */}
      <Row>
        <Col className='grid-c-6'>
          <Skeleton className='mb-2 h-4 w-20' />
          <Skeleton className='h-10 w-full' />
        </Col>
        <Col className='grid-c-6'>
          <Skeleton className='mb-2 h-4 w-32' />
          <Skeleton className='h-10 w-full' />
        </Col>
      </Row>
      {/* role / status */}
      <Row>
        <Col className='grid-c-6'>
          <Skeleton className='mb-2 h-4 w-24' />
          <Skeleton className='h-10 w-full' />
        </Col>
        <Col className='grid-c-6'>
          <Skeleton className='mb-2 h-4 w-28' />
          <Skeleton className='h-10 w-full' />
        </Col>
      </Row>
      <div className='mt-6 flex justify-end gap-3'>
        <Skeleton className='h-10 w-24' />
        <Skeleton className='h-10 w-24' />
      </div>
    </FormPageSkeleton>
  );
}
