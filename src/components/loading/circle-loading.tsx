import { Spinner } from '@/components/ui/spinner';
import { cn } from '@/lib';

type CircleLoadingProps = { className?: string };

export function CircleLoading({ className }: CircleLoadingProps) {
  return <Spinner className={cn('size-6 stroke-2', className)} />;
}
