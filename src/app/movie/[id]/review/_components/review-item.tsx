'use client';

import { useState } from 'react';
import { AvatarField } from '@/components/form';
import {
  AVATAR_SIZE_COMMENT,
  apiConfig,
  queryKeys,
  REVIEW_STATUS_HIDE,
  REVIEW_STATUS_SHOW
} from '@/constants';
import { useValidatePermission } from '@/hooks';
import { useChangeReviewStatusMutation } from '@/queries';
import type { ReviewResType, ToxicSpan } from '@/types';
import {
  getLastWord,
  invalidateQueries,
  notify,
  parseJSON,
  renderImageUrl
} from '@/utils';
import { logger } from '@/logger';
import { ReviewAction } from './review-action';
import { ReviewContent } from './review-content';
import { ReviewHeader } from './review-header';
import { ReviewItemSkeleton } from './review-item-skeleton';

type ReviewItemProps = {
  review: ReviewResType;
  onDelete: () => void;
};

export function ReviewItem({ review, onDelete }: ReviewItemProps) {
  const isHidden = review.status === REVIEW_STATUS_HIDE;
  const toxicSpans = review.toxicSpans
    ? parseJSON<ToxicSpan[]>(review.toxicSpans) || []
    : [];
  const hasToxicSpans = toxicSpans.length > 0;
  const [isVisible, setIsVisible] = useState(false);
  const canViewHiddenContent = isHidden || !!hasToxicSpans;
  const isBlurWholeContent = isHidden && !isVisible && !hasToxicSpans;
  const hasPermission = useValidatePermission();

  const {
    mutate: changeReviewStatusMutate,
    isPending: changeReviewStatusLoading
  } = useChangeReviewStatusMutation();

  const canDelete = hasPermission({
    requiredPermissions: [apiConfig.review.delete.permissionCode]
  });

  const canChangeStatus = hasPermission({
    requiredPermissions: [apiConfig.review.changeStatus.permissionCode]
  });

  const handleChangeReviewStatus = (id: string, status: number) => {
    changeReviewStatusMutate(
      {
        id,
        status:
          status === REVIEW_STATUS_SHOW
            ? REVIEW_STATUS_HIDE
            : REVIEW_STATUS_SHOW
      },
      {
        onSuccess: (res) => {
          if (res.result) {
            invalidateQueries([queryKeys.REVIEW_INFINITE]);
            notify.success(
              `${status === REVIEW_STATUS_SHOW ? 'Ẩn' : 'Hiện'} đánh giá thành công`
            );
          } else {
            notify.error(
              `${status === REVIEW_STATUS_SHOW ? 'Ẩn' : 'Hiện'} đánh giá thất bại`
            );
          }
        },
        onError: (error) => {
          logger.error('[CHANGE_STATUS_REVIEW_ERROR]', error);
          notify.error(
            `${status === REVIEW_STATUS_SHOW ? 'Ẩn' : 'Hiện'} đánh giá thất bại`
          );
        }
      }
    );
  };

  const handleViewContent = () => {
    setIsVisible((prev) => !prev);
  };

  return (
    <div className='pt-4'>
      <div className='flex items-start rounded-md border p-3 transition hover:bg-gray-50'>
        <AvatarField
          src={renderImageUrl(review.author.avatarPath)}
          previewClassName='rounded-full'
          size={AVATAR_SIZE_COMMENT}
          alt={getLastWord(review.author.fullName)}
          className='mr-4'
        />
        <div className='flex-1'>
          <ReviewHeader review={review} />

          <ReviewContent
            review={review}
            isBlurWholeContent={isBlurWholeContent}
          />

          <ReviewAction
            review={review}
            isVisible={isVisible}
            canDelete={canDelete}
            canChangeStatus={canChangeStatus}
            canViewHiddenContent={canViewHiddenContent}
            changeReviewStatusLoading={changeReviewStatusLoading}
            onChangeStatus={handleChangeReviewStatus}
            onViewContent={handleViewContent}
            onDelete={onDelete}
          />
        </div>
      </div>
    </div>
  );
}

ReviewItem.Skeleton = ReviewItemSkeleton;
