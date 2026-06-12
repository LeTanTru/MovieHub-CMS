import type { ReactNode } from 'react';

import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

const BREADCRUMB_WIDTHS = ['w-16', 'w-28', 'w-36', 'w-32'];

type FormPageSkeletonProps = {
  breadcrumbLevel?: number;
  children: ReactNode;
  panelClassName?: string;
};

function BreadcrumbSkeleton({ level }: { level: number }) {
  return (
    <div className='page-header flex items-center gap-2 px-5 py-4'>
      {Array.from({ length: level }).map((_, index) => (
        <div key={index} className='flex items-center gap-2'>
          <Skeleton
            className={cn('skeleton h-4', BREADCRUMB_WIDTHS[index] ?? 'w-32')}
          />
          {index < level - 1 && <span className='text-zinc-400'>/</span>}
        </div>
      ))}
    </div>
  );
}

export function FormPageSkeleton({
  breadcrumbLevel = 3,
  children,
  panelClassName
}: FormPageSkeletonProps) {
  return (
    <main
      className='bg-page-wrapper overflow-hidden'
      style={{ height: 'calc(100vh - 64px)' }}
    >
      <div className='min-h-[calc(100vh-128px)]'>
        <BreadcrumbSkeleton level={breadcrumbLevel} />
        <div className='flex flex-col gap-4 p-2'>
          <div className={cn('rounded-lg bg-white p-4', panelClassName)}>
            {children}
          </div>
        </div>
      </div>
    </main>
  );
}
