'use client';

import { type ReactNode, useEffect, useState } from 'react';
import { AvatarField } from '@/components/form';
import { cn } from '@/lib';
import {
  AVATAR_SIZE_COMMENT,
  apiConfig,
  queryKeys,
  REVIEW_STATUS_HIDE,
  REVIEW_STATUS_SHOW
} from '@/constants';
import { useDisclosure, useValidatePermission } from '@/hooks';
import { useChangeReviewStatusMutation } from '@/queries';
import type { ReviewResType } from '@/types';
import {
  getLastWord,
  invalidateQueries,
  notify,
  parseToxicSpans,
  renderImageUrl
} from '@/utils';
import { logger } from '@/logger';
import { ReviewAction } from './review-action';
import { ReviewContent } from './review-content';
import { ReviewHeader } from './review-header';
import { ReviewItemSkeleton } from './review-item-skeleton';
import { ReviewToxicSpansModal } from './review-toxic-spans-modal';
import { UserReportListModal } from './user-report-list-modal';
import { Element, scroller } from 'react-scroll';

type ReviewItemProps = {
  review: ReviewResType;
  onDelete: () => void;
  targetReviewId?: string | null;
  clearScrollTarget?: () => void;
};

export function ReviewItem({
  review,
  onDelete,
  targetReviewId,
  clearScrollTarget
}: ReviewItemProps) {
  const isHidden = review.status === REVIEW_STATUS_HIDE;
  const toxicSpans = parseToxicSpans(review.toxicSpans) ?? [];
  const hasToxicSpans = toxicSpans.length > 0;
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const canViewHiddenContent = isHidden || !!hasToxicSpans;
  const isBlurWholeContent = isHidden && !isVisible && !hasToxicSpans;
  const hasPermission = useValidatePermission();

  const scrollTargetName = `review-${review.id}`;
  const [isScrollTarget, setIsScrollTarget] = useState<boolean>(false);

  const {
    opened: openedReviewToxicSpansModal,
    open: openReviewToxicSpansModal,
    close: closeReviewToxicSpansModal
  } = useDisclosure();

  const [isReportModalOpen, setIsReportModalOpen] = useState<boolean>(false);

  const { mutate: changeReviewStatus, isPending } =
    useChangeReviewStatusMutation();

  const canDelete = hasPermission({
    requiredPermissions: [apiConfig.review.delete.permissionCode]
  });

  const canChangeStatus =
    hasPermission({
      requiredPermissions: [apiConfig.review.changeStatus.permissionCode]
    }) && !hasToxicSpans;

  const canUpdateToxicSpans = hasPermission({
    requiredPermissions: [apiConfig.review.updateToxicSpans.permissionCode]
  });

  const handleChangeReviewStatus = (id: string, status: number) => {
    changeReviewStatus(
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

  useEffect(() => {
    if (targetReviewId !== review.id) return;

    let clearHighlightTimeout: NodeJS.Timeout | null = null;

    const scrollTimeout = setTimeout(() => {
      scroller.scrollTo(scrollTargetName, {
        containerId: 'page-wrapper-scroll-container',
        duration: 500,
        smooth: 'easeInOutQuart',
        offset: -250
      });

      setIsScrollTarget(true);
      clearHighlightTimeout = setTimeout(() => {
        setIsScrollTarget(false);
        clearScrollTarget?.();
      }, 2000);
    }, 100);

    return () => {
      setIsScrollTarget(false);
      clearTimeout(scrollTimeout);
      if (clearHighlightTimeout) clearTimeout(clearHighlightTimeout);
    };
  }, [clearScrollTarget, review.id, scrollTargetName, targetReviewId]);

  const renderContent = (): ReactNode => {
    const content = review.content;

    if (!hasToxicSpans) return content;

    const result: ReactNode[] = [];
    let lastIndex = 0;

    toxicSpans.forEach((span, index) => {
      const start = Math.min(Math.max(span.start, lastIndex), content.length);
      const end = Math.min(Math.max(span.end, start), content.length);

      if (start > lastIndex) {
        result.push(content.slice(lastIndex, start));
      }

      if (start === end) {
        lastIndex = start;
        return;
      }

      result.push(
        <span
          className={cn({ 'blur-xs select-none': !isVisible })}
          key={`${start}-${end}-${index}`}
        >
          {content.slice(start, end)}
        </span>
      );

      lastIndex = end;
    });

    result.push(content.slice(lastIndex));

    return <>{result}</>;
  };

  return (
    <>
      <Element name={scrollTargetName}>
        <div className='pt-4'>
          <div
            className={cn(
              'flex items-start rounded-md border p-3 transition hover:bg-gray-50',
              {
                'ring-sporty-blue ring-2 transition-all duration-200 ease-linear':
                  isScrollTarget
              }
            )}
          >
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
                renderContent={renderContent}
              />

              <ReviewAction
                review={review}
                isVisible={isVisible}
                canDelete={canDelete}
                canChangeStatus={canChangeStatus}
                canUpdateToxicSpans={canUpdateToxicSpans}
                canViewHiddenContent={canViewHiddenContent}
                changeReviewStatusLoading={isPending}
                onChangeStatus={handleChangeReviewStatus}
                onViewContent={handleViewContent}
                onDelete={onDelete}
                onToxicSpansClick={openReviewToxicSpansModal}
                onReportClick={() => setIsReportModalOpen(true)}
              />
            </div>
          </div>
        </div>
      </Element>
      <ReviewToxicSpansModal
        opened={openedReviewToxicSpansModal}
        onClose={closeReviewToxicSpansModal}
        review={review}
      />
      <UserReportListModal
        reviewId={review.id}
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
      />
    </>
  );
}

ReviewItem.Skeleton = ReviewItemSkeleton;
