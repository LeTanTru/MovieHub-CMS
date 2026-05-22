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
import { useCallback } from 'react';
import { renderListPageUrl } from '@/utils';

export function ReviewList() {
  const { id: movieId } = useParams<{ id: string }>();
  const { searchParams, serializeParams, deprefixParams } =
    useQueryParams<Record<string, string>>();
  const parentParams = deprefixParams(searchParams);
  const { movieTitle, parentPage, ...restSearchParams } = parentParams;

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
      notShowFromSearchParams: ['movieId'],
      showNotify: false
    }
  });

  const totalStars = reviewList.reduce((acc, item) => {
    return acc + item.rate;
  }, 0);

  const handleDeleteReview = useCallback(
    async (review: ReviewResType) => {
      handlers.handleDeleteClick(review.id);
    },
    [handlers]
  );

  return (
    <PageWrapper
      breadcrumbs={[
        {
          label: 'Phim',
          href: renderListPageUrl(
            route.movie.getList.path,
            serializeParams({ ...restSearchParams, page: parentPage })
          )
        },
        { label: movieTitle || 'Chi tiết' },
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
