import type { HTMLAttributes, PropsWithChildren } from 'react';
import { cn } from '@/lib';

type RowProps = PropsWithChildren<HTMLAttributes<HTMLDivElement>>;

export default function Row({ children, className, ...rest }: RowProps) {
  const childrenLength = Array.isArray(children)
    ? children.length
    : children
      ? 1
      : 0;
  return (
    <div
      className={cn(
        '-mx-2 flex w-full flex-wrap',
        {
          'mb-6': childrenLength > 0,
          'mb-0': childrenLength === 0
        },
        className
      )}
      {...rest}
    >
      {children}
    </div>
  );
}
