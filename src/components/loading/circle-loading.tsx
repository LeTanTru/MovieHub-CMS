import { Spinner } from '@/components/ui/spinner';
import { cn } from '@/lib';

type CircleLoadingProps = { className?: string };

export default function CircleLoading({ className }: CircleLoadingProps) {
  return (
    <Spinner className={cn('size-6 stroke-2 dark:stroke-white', className)} />
  );
}
