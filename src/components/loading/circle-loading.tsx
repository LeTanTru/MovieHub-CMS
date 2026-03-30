import { Spinner } from '@/components/ui/spinner';
import { cn } from '@/lib';

export default function CircleLoading({ className }: { className?: string }) {
  return <Spinner className={cn('size-6 stroke-2', className)} />;
}
