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

ReviewItem.Skeleton = function () {
  return (
    <div className='flex h-30 w-full items-start rounded-md border p-3 transition hover:bg-gray-50'>
      <div className='skeleton size-10 rounded-full!'></div>
      <div className='flex-1'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-x-2'>
            <h4 className='flex items-center gap-x-2 font-medium text-gray-800'>
              <div className='skeleton h-5 w-30 font-semibold'></div>
              <div className='skeleton size-5'></div>
              <div className='skeleton h-5 w-20'></div>
              <div className='skeleton h-5 w-10'></div>
              <div className='skeleton size-5'></div>
            </h4>
          </div>
          <div className='skeleton mr-2 size-5'></div>
        </div>
        <p className='skeleton mt-4 h-5 w-100 text-gray-700'></p>

        <div className='mt-4 flex items-center gap-x-4 text-sm text-gray-500'>
          <div className='skeleton h-5 w-10'></div>
          <div className='skeleton h-5 w-10'></div>
          <div className='skeleton h-5 w-10'></div>
          <div className='skeleton h-5 w-10'></div>
          <div className='skeleton h-5 w-10'></div>
        </div>
      </div>
    </div>
  );
};
