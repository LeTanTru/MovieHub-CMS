import { HTMLAttributes, PropsWithChildren } from 'react';
import { cn } from '@/lib';

type RowProps = PropsWithChildren<HTMLAttributes<HTMLDivElement>>;

export default function Row({ children, className, ...rest }: RowProps) {
  const childCount = Array.isArray(children)
    ? children.filter(Boolean).length
    : 1;

  return (
    <div
      className={cn(
        'mb-6 flex w-full flex-row [&>*:first-child]:pl-0',
        { '[&>*:last-child]:pr-0': childCount > 1 },
        { '-mr-2': childCount === 1 },
        className
      )}
      {...rest}
    >
      {children}
    </div>
  );
}
