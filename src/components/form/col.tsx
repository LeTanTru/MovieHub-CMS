import type { PropsWithChildren, HTMLAttributes } from 'react';
import { cn } from '@/lib';

type ColProps = PropsWithChildren<HTMLAttributes<HTMLDivElement>>;

export default function Col({ children, className, ...rest }: ColProps) {
  return (
    <div className={cn('grid-col flex w-full flex-col', className)} {...rest}>
      {children}
    </div>
  );
}
