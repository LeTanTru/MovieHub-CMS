import { cn } from '@/lib';
import { Loader2 } from 'lucide-react';

export default function CircleLoading({ className }: { className?: string }) {
  return (
    <Loader2
      className={cn(
        'mx-auto size-6 animate-spin stroke-white stroke-2',
        className
      )}
    />
  );
}
