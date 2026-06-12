'use client';

import { Col, Row } from '@/components/form';
import { FormImageUploadSkeleton } from '@/components/loading/form-image-upload-skeleton';
import { FormPageSkeleton } from '@/components/loading/form-page-skeleton';
import { Skeleton } from '@/components/ui/skeleton';

export function SidebarFormSkeleton() {
  return (
    <FormPageSkeleton>
      {/* Two image upload panels side by side */}
      <Row>
        <Col className='grid-c-6'>
          <FormImageUploadSkeleton
            labelClassName='w-36'
            previewClassName='h-[150px] w-[267px] rounded-lg'
          />
        </Col>
        <Col className='grid-c-6'>
          <FormImageUploadSkeleton
            labelClassName='w-36'
            previewClassName='h-[150px] w-[100px] rounded-lg'
          />
        </Col>
      </Row>
      {/* Movie autocomplete + color picker */}
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
      {/* Checkbox row */}
      <Row>
        <Col className='grid-c-6'>
          <Skeleton className='h-5 w-20' />
        </Col>
      </Row>
      {/* Rich text block */}
      <Row>
        <Col className='grid-c-12'>
          <Skeleton className='mb-2 h-4 w-24' />
          <Skeleton className='h-48 w-full rounded-lg' />
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
