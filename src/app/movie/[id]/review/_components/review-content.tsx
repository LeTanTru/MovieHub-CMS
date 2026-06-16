import { StarRating } from '@/components/star-rating';
import { cn } from '@/lib';
import type { ReviewResType } from '@/types';

type ReviewContentProps = {
  review: ReviewResType;
  isBlurWholeContent: boolean;
};

export function ReviewContent({
  review,
  isBlurWholeContent
}: ReviewContentProps) {
  return (
    <div className='mt-2 flex flex-col gap-2'>
      <p
        className={cn('break-all text-gray-700', {
          'max-640:text-[13px] blur-xs select-none': isBlurWholeContent
        })}
      >
        {review.content}
      </p>
      <StarRating value={review.rate} showValue={false} />
    </div>
  );
}
