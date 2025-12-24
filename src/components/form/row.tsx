import { HTMLAttributes, PropsWithChildren } from 'react';
import { cn } from '@/lib';

type RowProps = PropsWithChildren<HTMLAttributes<HTMLDivElement>>;

export default function Row({ children, className, ...rest }: RowProps) {
  return (
    <div
      className={cn(
        'mb-6 flex w-full flex-row [&>*:first-child]:pl-0',
        {
          '[&>*:last-child]:pr-0': !Array.isArray(children)
        },
        className
      )}
      {...rest}
    >
      {children}
    </div>
  );
}
