import { Col, Row } from '@/components/form';
import { FormPageSkeleton } from '@/components/loading/form-page-skeleton';
import { Skeleton } from '@/components/ui/skeleton';

export default function Loading() {
  return (
    <FormPageSkeleton
      breadcrumbLevel={4}
      panelClassName='overflow-hidden bg-list-page-wrapper p-0'
    >
      <Row className='grid-row-no-gutters mb-0 items-stretch'>
        <Col className='grid-c-9 grid-col-no-gutters'>
          <div className='p-4'>
            <Skeleton className='aspect-video w-full rounded-lg' />
          </div>
          <div className='mx-4 mb-4 rounded-md bg-white p-4 shadow-sm'>
            <div className='mb-3 flex items-center justify-between gap-2 border-b border-gray-100 pb-2'>
              <Skeleton className='h-5 w-32' />
            </div>
            <Row>
              <Col className='grid-c-6'>
                <Skeleton className='mb-2 h-4 w-32' />
                <Skeleton className='h-10 w-full' />
              </Col>
              <Col className='grid-c-6'>
                <Skeleton className='mb-2 h-4 w-32' />
                <Skeleton className='h-10 w-full' />
              </Col>
            </Row>
            <Row>
              <Col className='grid-c-12'>
                <Skeleton className='mb-2 h-4 w-32' />
                <Skeleton className='h-24 w-full rounded-lg' />
              </Col>
            </Row>
            <Row className='mb-0 justify-end'>
              <Col className='w-40'>
                <Skeleton className='h-10 w-full' />
              </Col>
              <Col className='w-40'>
                <Skeleton className='h-10 w-full' />
              </Col>
            </Row>
          </div>
        </Col>
        <Col className='grid-c-3 grid-col-no-gutters'>
          <div className='h-full border-l border-zinc-100 bg-white p-4'>
            <Skeleton className='mb-4 h-5 w-32' />
            <div className='flex flex-col gap-3'>
              {Array.from({ length: 10 }).map((_, index) => (
                <div key={index} className='rounded-md border p-3'>
                  <div className='mb-2 flex items-center justify-between gap-3'>
                    <Skeleton className='h-4 w-20' />
                    <Skeleton className='h-4 w-16' />
                  </div>
                  <Skeleton className='mb-2 h-3 w-full' />
                  <Skeleton className='h-3 w-4/5' />
                </div>
              ))}
            </div>
          </div>
        </Col>
      </Row>
    </FormPageSkeleton>
  );
}
