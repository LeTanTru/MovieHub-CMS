'use client';

import { Col, Row } from '@/components/form';
import { Skeleton } from '@/components/ui/skeleton';

function FormSkeleton() {
  return (
    <div className='rounded-lg bg-white p-6'>
      <div className='mb-8 flex items-center gap-4'>
        <Skeleton className='h-10 w-48' />
        <Skeleton className='h-10 w-32' />
      </div>
      <div className='mb-8'>
        <Skeleton className='mb-2 h-4 w-24' />
        <Skeleton className='h-12 w-full' />
      </div>
      <Row>
        <Col className='col-span-1'>
          <Skeleton className='mb-2 h-4 w-24' />
          <Skeleton className='h-12 w-full' />
        </Col>
        <Col className='col-span-1'>
          <Skeleton className='mb-2 h-4 w-24' />
          <Skeleton className='h-12 w-full' />
        </Col>
      </Row>
      <Row>
        <Col className='col-span-1'>
          <Skeleton className='mb-2 h-4 w-24' />
          <Skeleton className='h-12 w-full' />
        </Col>
        <Col className='col-span-1'>
          <Skeleton className='mb-2 h-4 w-24' />
          <Skeleton className='h-12 w-full' />
        </Col>
      </Row>
      <Row>
        <Col className='col-span-1'>
          <Skeleton className='mb-2 h-4 w-24' />
          <Skeleton className='h-12 w-full' />
        </Col>
        <Col className='col-span-1'>
          <Skeleton className='mb-2 h-4 w-24' />
          <Skeleton className='h-12 w-full' />
        </Col>
      </Row>
      <Row>
        <Col className='col-span-1'>
          <Skeleton className='mb-2 h-4 w-24' />
          <Skeleton className='h-12 w-full' />
        </Col>
        <Col className='col-span-1'>
          <Skeleton className='mb-2 h-4 w-24' />
          <Skeleton className='h-12 w-full' />
        </Col>
      </Row>
      <div className='mb-8'>
        <Skeleton className='mb-2 h-4 w-24' />
        <Skeleton className='h-48 w-full' />
      </div>
      <div className='mt-6 flex justify-end gap-3'>
        <Skeleton className='h-10 w-28' />
        <Skeleton className='h-10 w-28' />
      </div>
    </div>
  );
}

export default FormSkeleton;
