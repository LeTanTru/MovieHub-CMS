import { HTMLAttributes, PropsWithChildren } from 'react';
import { cn } from '@/lib';

type RowProps = PropsWithChildren<HTMLAttributes<HTMLDivElement>>;

export default function Row({ children, className, ...rest }: RowProps) {
  return (
    <div className={cn('-mx-2 mb-6 flex flex-wrap', className)} {...rest}>
      {children}
    </div>
  );
}
