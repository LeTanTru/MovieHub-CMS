import type { CSSProperties, HTMLAttributes, PropsWithChildren } from 'react';
import { cn } from '@/lib';

type RowProps = PropsWithChildren<HTMLAttributes<HTMLDivElement>> & {
  gutter?: number;
};

export default function Row({
  children,
  className,
  gutter = 8,
  ...rest
}: RowProps) {
  const childCount = Array.isArray(children)
    ? children.length
    : children
      ? 1
      : 0;

  const _gutter = childCount > 1 ? gutter : 0;

  return (
    <div
      className={cn('mb-6 flex w-full flex-wrap', className)}
      style={
        {
          '--gutter': `${_gutter}px`,
          gap: (_gutter * childCount) / (childCount - 1 || childCount)
        } as CSSProperties
      }
      {...rest}
    >
      {children}
    </div>
  );
}
