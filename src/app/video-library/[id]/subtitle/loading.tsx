import { Col, Row } from '@/components/form';
import { Skeleton } from '@/components/ui/skeleton';

export default function Loading() {
  return (
    <main
      className='bg-page-wrapper overflow-hidden'
      style={{ height: 'calc(100vh - 64px)' }}
    >
      <div className='min-h-[calc(100vh-128px)]'>
        {/* Breadcrumbs skeleton */}
        <div className='page-header flex items-center gap-2 px-5 py-4'>
          <Skeleton className='skeleton h-4 w-16' />
          <span className='text-zinc-400'>/</span>
          <Skeleton className='skeleton h-4 w-28' />
          <span className='text-zinc-400'>/</span>
          <Skeleton className='skeleton h-4 w-16' />
        </div>

        <div className='page-content px-2 pb-2'>
          <div className='bg-list-page-wrapper min-h-[calc(100vh-190px)] rounded-lg p-4'>
            {/* Header / Action buttons skeleton */}
            <div className='flex items-start justify-between pb-4'>
              <div className='flex-1'></div>
              <div className='ml-auto flex gap-2'>
                {/* Reload button skeleton */}
                <Skeleton className='h-10 w-10 rounded-md' />
                {/* Add new subtitle button skeleton */}
                <Skeleton className='h-10 w-40 rounded-md' />
              </div>
            </div>

            {/* Video player and Subtitle list content skeleton */}
            <Row className='grid-row-no-gutters'>
              <Col className='grid-c-9 grid-col-no-gutters pr-4'>
                <Skeleton className='aspect-video w-full rounded-lg' />
              </Col>
              <Col className='grid-c-3 grid-col-no-gutters flex flex-col gap-3'>
                {Array.from({ length: 4 }).map((_, i) => (
                  <div
                    key={i}
                    className='border-zinc-150 flex items-center justify-between rounded-lg border bg-white p-3 shadow-sm'
                  >
                    <div className='flex flex-1 items-center gap-2'>
                      {/* Subtitle label and language placeholder */}
                      <Skeleton className='h-5 w-32 rounded' />
                      {/* Check badge placeholder for default subtitle */}
                      {i === 0 && (
                        <Skeleton className='size-5 rounded-full bg-blue-100' />
                      )}
                    </div>
                    {/* Action buttons (edit/delete) placeholder */}
                    <div className='flex items-center gap-2'>
                      <Skeleton className='size-6 rounded' />
                      <div className='h-4 w-px bg-zinc-200' />
                      <Skeleton className='size-6 rounded' />
                    </div>
                  </div>
                ))}
              </Col>
            </Row>
          </div>
        </div>
      </div>
    </main>
  );
}
