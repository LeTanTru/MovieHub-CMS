'use client';

import { Col, Row } from '@/components/form';
import { FormPageSkeleton } from '@/components/loading/form-page-skeleton';
import { Skeleton } from '@/components/ui/skeleton';

export function CollectionFormSkeleton() {
  return (
    <FormPageSkeleton>
      {/* name / type */}
      <Row>
        <Col className='grid-c-6'>
          <Skeleton className='mb-2 h-4 w-32' />
          <Skeleton className='h-10 w-full' />
        </Col>
        <Col className='grid-c-6'>
          <Skeleton className='mb-2 h-4 w-16' />
          <Skeleton className='h-10 w-full' />
        </Col>
      </Row>
      {/* Color list + style selector */}
      <Row>
        <Col className='grid-c-6'>
          <Skeleton className='mb-2 h-4 w-32' />
          <div className='space-y-2'>
            <Skeleton className='h-10 w-full rounded' />
            <Skeleton className='h-10 w-full rounded' />
            <Skeleton className='h-8 w-full rounded' />
          </div>
        </Col>
        <Col className='grid-c-6'>
          <Skeleton className='mb-2 h-4 w-24' />
          <Skeleton className='h-10 w-full' />
        </Col>
      </Row>
      {/* fillData checkbox */}
      <Row>
        <Col className='grid-c-6'>
          <Skeleton className='h-5 w-40' />
        </Col>
      </Row>
      {/* Filter FieldSet */}
      <div className='mt-4 rounded-lg border p-4'>
        <Skeleton className='mb-4 h-5 w-20' />
        {/* type / ageRating */}
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
        {/* country / language */}
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
        {/* categories / limit */}
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
        {/* checkbox flags row */}
        <Row>
          <Col className='grid-c-3'>
            <Skeleton className='h-5 w-12' />
          </Col>
          <Col className='grid-c-3'>
            <Skeleton className='h-5 w-24' />
          </Col>
          <Col className='grid-c-3'>
            <Skeleton className='h-5 w-20' />
          </Col>
        </Row>
        {/* Reset button */}
        <div className='mt-4 flex justify-end'>
          <Skeleton className='h-9 w-32' />
        </div>
      </div>
      <div className='mt-6 flex justify-end gap-3'>
        <Skeleton className='h-10 w-24' />
        <Skeleton className='h-10 w-24' />
      </div>
    </FormPageSkeleton>
  );
}
