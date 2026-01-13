import type { PropsWithChildren, HTMLAttributes } from 'react';
import { cn } from '@/lib';

type ColProps = PropsWithChildren<HTMLAttributes<HTMLDivElement>> & {
  span?: number;
  gutter?: number;
};

export default function Col({
  children,
  className,
  span = 12,
  gutter = 0,
  ...rest
}: ColProps) {
  const width = gutter
    ? `calc(${(span * 100) / 24}% - ${gutter}px)`
    : `${(span * 100) / 24}%`;

  return (
    <div
      style={{ width }}
      className={cn('my-1 flex flex-col px-2', className)}
      {...rest}
    >
      {children}
    </div>
  );
}
