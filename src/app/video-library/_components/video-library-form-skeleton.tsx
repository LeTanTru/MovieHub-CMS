'use client';

import { Col, Row } from '@/components/form';
import { FormImageUploadSkeleton } from '@/components/loading/form-image-upload-skeleton';
import { FormPageSkeleton } from '@/components/loading/form-page-skeleton';
import { Skeleton } from '@/components/ui/skeleton';

export function VideoLibraryFormSkeleton() {
  return (
    <FormPageSkeleton>
      {/* Thumbnail upload */}
      <Row>
        <Col className='grid-c-12'>
          <FormImageUploadSkeleton
            labelClassName='w-28'
            previewClassName='h-[150px] w-[267px] rounded-lg'
          />
        </Col>
      </Row>
      {/* name / sourceType */}
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
      {/* introStart / introEnd */}
      <Row>
        <Col className='grid-c-6'>
          <Skeleton className='mb-2 h-4 w-36' />
          <Skeleton className='h-10 w-full' />
        </Col>
        <Col className='grid-c-6'>
          <Skeleton className='mb-2 h-4 w-36' />
          <Skeleton className='h-10 w-full' />
        </Col>
      </Row>
      {/* outroStart */}
      <Row>
        <Col className='grid-c-6'>
          <Skeleton className='mb-2 h-4 w-36' />
          <Skeleton className='h-10 w-full' />
        </Col>
      </Row>
      {/* Video upload area */}
      <Row>
        <Col className='grid-c-12'>
          <Skeleton className='mb-2 h-4 w-16' />
          <Skeleton className='h-[200px] w-full rounded-lg' />
        </Col>
      </Row>
      {/* Description rich text */}
      <Row>
        <Col className='grid-c-12'>
          <Skeleton className='mb-2 h-4 w-16' />
          <Skeleton className='h-48 w-full rounded-lg' />
        </Col>
      </Row>
      <div className='mt-6 flex justify-end gap-3'>
        <Skeleton className='h-10 w-24' />
        <Skeleton className='h-10 w-24' />
      </div>
    </FormPageSkeleton>
  );
}
