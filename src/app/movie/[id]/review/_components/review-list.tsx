'use client';

import { Button } from '@/components/form';
import { ListPageWrapper, PageWrapper } from '@/components/layout';
import { DotLoading } from '@/components/loading';
import { NoData } from '@/components/no-data';
import {
  SKELETON_LOADING_COUNT,
  apiConfig,
  objectNames,
  queryKeys
} from '@/constants';
import { useInfiniteListBase, useQueryParams } from '@/hooks';
import { route } from '@/routes';
import type { ReviewResType, ReviewSearchType } from '@/types';
import { useParams } from 'next/navigation';
import { ReviewItem } from './review-item';
import { renderListPageUrl } from '@/utils';
import { useReviewStore } from '@/store';
import { useEffect } from 'react';
import { useShallow } from 'zustand/react/shallow';

export function ReviewList() {
  const { id: movieId } = useParams<{ id: string }>();
  const { searchParams, serializeParams, deprefixParams } =
    useQueryParams<Record<string, string>>();
  const parentParams = deprefixParams(searchParams);
  const { movieTitle, parentPage, ...restParentParams } = parentParams;

  const { targetReviewId, clearScrollTarget } = useReviewStore(
    useShallow((s) => ({
      targetReviewId: s.targetReviewId,
      clearScrollTarget: s.clearScrollTarget
    }))
  );

  const {
    data: reviewList,
    loading,
    handlers,
    isFetchingMore,
    hasMore,
    totalLeft,
    totalElements
  } = useInfiniteListBase<ReviewResType, ReviewSearchType>({
    apiConfig: apiConfig.review,
    options: {
      objectName: objectNames.REVIEW,
      queryKey: queryKeys.REVIEW,
      defaultFilters: { movieId },
      notShowFromSearchParams: ['movieId']
    }
  });

  const totalStars = reviewList.reduce((acc, item) => {
    return acc + item.rate;
  }, 0);

  const handleDeleteReview = async (review: ReviewResType) => {
    handlers.handleDeleteClick(review.id);
  };

  // Auto-load-more until target review is visible in the list
  useEffect(() => {
    if (!targetReviewId || loading || isFetchingMore || !hasMore) return;
    if (reviewList.some((r) => r.id === targetReviewId)) return;
    handlers.loadMore();
  }, [reviewList, handlers, hasMore, isFetchingMore, loading, targetReviewId]);

  return (
    <PageWrapper
      breadcrumbs={[
        {
          label: 'Phim',
          href: renderListPageUrl(
            route.movie.getList.path,
            serializeParams({ ...restParentParams, page: parentPage })
          )
        },
        { label: (movieTitle as string) || 'Chi tiết' },
        { label: 'Đánh giá' }
      ]}
    >
      <ListPageWrapper>
        {loading ? (
          <div className='space-y-4 p-4'>
            <div className='skeleton ml-4 h-5 w-20' />
            {Array.from({ length: SKELETON_LOADING_COUNT }).map((_, index) => (
              <ReviewItem.Skeleton key={index} />
            ))}
          </div>
        ) : reviewList.length === 0 ? (
          <NoData content='Chưa có đánh giá nào' />
        ) : (
          <div className='mt-4 p-4'>
            <h4 className='-mb-2 ml-2 font-semibold text-black'>
              Đánh giá ({totalElements}) ({((totalStars * 2) / 3)?.toFixed(2)})
            </h4>
            {reviewList.map((item) => (
              <ReviewItem
                key={item.id}
                review={item}
                targetReviewId={targetReviewId}
                clearScrollTarget={clearScrollTarget}
                onDelete={() => handleDeleteReview(item)}
              />
            ))}
            {isFetchingMore && <DotLoading className='mt-4' />}
            {hasMore && (
              <Button
                variant='ghost'
                className='mx-auto block'
                onClick={handlers.loadMore}
              >
                Xem thêm ({totalLeft}) đánh giá
              </Button>
            )}
          </div>
        )}
      </ListPageWrapper>
    </PageWrapper>
  );
}
