import { cn } from '@/lib';
import type { ReactNode } from 'react';

type CommentContentProps = {
  children: ReactNode;
  isBlurWholeContent: boolean;
};

export function CommentContent({
  children,
  isBlurWholeContent
}: CommentContentProps) {
  return (
    <p
      className={cn('mt-4 break-all text-gray-700', {
        'max-640:text-[13px] blur-xs select-none': isBlurWholeContent
      })}
    >
      {children}
    </p>
  );
}
