import type { HTMLAttributes, PropsWithChildren } from 'react';
import { cn } from '@/lib';

type RowProps = PropsWithChildren<HTMLAttributes<HTMLDivElement>>;

export function Row({ children, className, ...rest }: RowProps) {
  return (
    <div className={cn('grid-row mb-6', className)} {...rest}>
      {children}
    </div>
  );
}
