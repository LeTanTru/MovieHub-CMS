import { StarRating } from '@/components/star-rating';
import { cn } from '@/lib';
import type { ReactNode } from 'react';
import type { ReviewResType } from '@/types';

type ReviewContentProps = {
  review: ReviewResType;
  isBlurWholeContent: boolean;
  renderContent?: () => ReactNode;
};

export function ReviewContent({
  review,
  isBlurWholeContent,
  renderContent
}: ReviewContentProps) {
  return (
    <div className='mt-2 flex flex-col gap-2'>
      <p
        className={cn('break-all text-gray-700', {
          'max-640:text-[13px] blur-xs select-none': isBlurWholeContent
        })}
      >
        {renderContent ? renderContent() : review.content}
      </p>
      <StarRating value={review.rate} showValue={false} />
    </div>
  );
}
