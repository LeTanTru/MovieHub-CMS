'use client';

import { Col, Row } from '@/components/form';
import { FormImageUploadSkeleton } from '@/components/loading/form-image-upload-skeleton';
import { FormPageSkeleton } from '@/components/loading/form-page-skeleton';
import { Skeleton } from '@/components/ui/skeleton';

export function ProfileFormSkeleton() {
  return (
    <FormPageSkeleton breadcrumbLevel={2} panelClassName='mx-auto w-1/2'>
      {/* Avatar upload */}
      <Row>
        <Col className='grid-c-12'>
          <FormImageUploadSkeleton
            labelClassName='w-24'
            previewClassName='size-[120px] rounded-full'
          />
        </Col>
      </Row>
      {/* Full name */}
      <Row>
        <Col className='grid-c-12'>
          <Skeleton className='mb-2 h-4 w-24' />
          <Skeleton className='h-10 w-full' />
        </Col>
      </Row>
      {/* Old password */}
      <Row>
        <Col className='grid-c-12'>
          <Skeleton className='mb-2 h-4 w-32' />
          <Skeleton className='h-10 w-full' />
        </Col>
      </Row>
      {/* New password */}
      <Row>
        <Col className='grid-c-12'>
          <Skeleton className='mb-2 h-4 w-28' />
          <Skeleton className='h-10 w-full' />
        </Col>
      </Row>
      {/* Confirm password */}
      <Row>
        <Col className='grid-c-12'>
          <Skeleton className='mb-2 h-4 w-36' />
          <Skeleton className='h-10 w-full' />
        </Col>
      </Row>
      {/* Footer actions */}
      <div className='mt-6 flex justify-end gap-3'>
        <Skeleton className='h-10 w-24' />
        <Skeleton className='h-10 w-24' />
      </div>
    </FormPageSkeleton>
  );
}
