import type { PropsWithChildren, HTMLAttributes } from 'react';
import { cn } from '@/lib';

type ColProps = PropsWithChildren<HTMLAttributes<HTMLDivElement>> & {
  span?: number;
};

export default function Col({
  children,
  className,
  span = 12,
  ...rest
}: ColProps) {
  const width = `${(span * 100) / 24}%`;

  return (
    <div
      style={{ width: `calc(${width} - var(--gutter))` }}
      className={cn('flex flex-col', className)}
      {...rest}
    >
      {children}
    </div>
  );
}
