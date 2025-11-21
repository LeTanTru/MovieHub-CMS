import { HTMLAttributes, PropsWithChildren } from 'react';
import { cn } from '@/lib';

type RowProps = PropsWithChildren<HTMLAttributes<HTMLDivElement>>;

export default function Row({ children, className, ...rest }: RowProps) {
  const childCount = Array.isArray(children) ? children.length : 1;

  return (
    <div
      className={cn(
        'mb-6 flex w-full flex-row gap-x-2 [&>*:first-child]:pl-0',
        { '[&>*:first-child]:pr-0 [&>*:last-child]:pr-0': childCount > 1 },
        { '[&>*:last-child]:pr-0': childCount === 1 },
        className
      )}
      {...rest}
    >
      {children}
    </div>
  );
}
