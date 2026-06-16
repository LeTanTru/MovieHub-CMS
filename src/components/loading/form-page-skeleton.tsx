import type { ReactNode } from 'react';

import { Col, Row } from '@/components/form';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { FormImageUploadSkeleton } from './form-image-upload-skeleton';

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

FormPageSkeleton.Row = function FormSkeletonRow({
  children,
  className
}: {
  children: ReactNode;
  className?: string;
}) {
  return <Row className={className}>{children}</Row>;
};

FormPageSkeleton.Col = function FormSkeletonCol({
  children,
  span,
  className
}: {
  children: ReactNode;
  span?: number;
  className?: string;
}) {
  return (
    <Col className={cn(span !== undefined && `grid-c-${span}`, className)}>
      {children}
    </Col>
  );
};

FormPageSkeleton.Field = function FormSkeletonField({
  labelWidth = 'w-24',
  height = 'h-10',
  className
}: {
  labelWidth?: string;
  height?: string;
  className?: string;
}) {
  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <Skeleton className={cn('h-4', labelWidth)} />
      <Skeleton className={cn('w-full', height)} />
    </div>
  );
};

FormPageSkeleton.ImageUpload = function FormSkeletonImageUpload({
  labelWidth = 'w-24',
  previewClassName
}: {
  labelWidth?: string;
  previewClassName: string;
}) {
  return (
    <FormImageUploadSkeleton
      labelClassName={labelWidth}
      previewClassName={previewClassName}
    />
  );
};

FormPageSkeleton.RichText = function FormSkeletonRichText({
  labelWidth = 'w-24',
  height = 'h-48',
  className
}: {
  labelWidth?: string;
  height?: string;
  className?: string;
}) {
  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <Skeleton className={cn('h-4', labelWidth)} />
      <Skeleton className={cn('w-full rounded-lg', height)} />
    </div>
  );
};

FormPageSkeleton.Checkbox = function FormSkeletonCheckbox({
  width = 'w-12',
  height = 'h-5',
  className
}: {
  width?: string;
  height?: string;
  className?: string;
}) {
  return <Skeleton className={cn(width, height, className)} />;
};

FormPageSkeleton.Section = function FormSkeletonSection({
  children,
  titleWidth = 'w-20',
  className
}: {
  children: ReactNode;
  titleWidth?: string;
  className?: string;
}) {
  return (
    <div className={cn('mt-4 rounded-lg border p-4', className)}>
      <Skeleton className={cn('mb-4 h-5', titleWidth)} />
      {children}
    </div>
  );
};

FormPageSkeleton.Actions = function FormSkeletonActions({
  count = 2,
  width = 'w-24',
  height = 'h-10',
  className
}: {
  count?: number;
  width?: string;
  height?: string;
  className?: string;
}) {
  return (
    <div className={cn('mt-6 flex justify-end gap-3', className)}>
      {Array.from({ length: count }).map((_, index) => (
        <Skeleton key={index} className={cn(height, width)} />
      ))}
    </div>
  );
};
