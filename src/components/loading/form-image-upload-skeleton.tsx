import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

type FormImageUploadSkeletonProps = {
  labelClassName?: string;
  previewClassName: string;
};

export function FormImageUploadSkeleton({
  labelClassName,
  previewClassName
}: FormImageUploadSkeletonProps) {
  return (
    <div className='flex flex-col items-center justify-center gap-2'>
      <Skeleton className={cn('h-4', labelClassName)} />
      <Skeleton className={previewClassName} />
    </div>
  );
}
