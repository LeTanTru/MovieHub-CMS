'use client';

import { Button } from '@/components/form';
import ReviewItemSkeleton from './review-item-skeleton';
import { ListPageWrapper, PageWrapper } from '@/components/layout';
import { DotLoading } from '@/components/loading';
import { NoData } from '@/components/no-data';
import { apiConfig } from '@/constants';
import { useInfiniteListBase, useQueryParams } from '@/hooks';
import { route } from '@/routes';
import type { ReviewResType, ReviewSearchType } from '@/types';
import { useParams } from 'next/navigation';
import ReviewItem from './review-item';
import { useCallback } from 'react';
import { Activity } from '@/components/activity';

export default function ReviewList({ queryKey }: { queryKey: string }) {
  const { id: movieId } = useParams<{ id: string }>();
  const { searchParams } = useQueryParams<{ movieTitle: string }>();

  const {
    data,
    loading,
    handlers,
    isFetchingMore,
    hasMore,
    totalLeft,
    totalElements
  } = useInfiniteListBase<ReviewResType, ReviewSearchType>({
    apiConfig: apiConfig.review,
    options: {
      objectName: 'đánh giá',
      queryKey,
      defaultFilters: { movieId },
      notShowFromSearchParams: ['movieId'],
      excludeFromQueryFilter: ['movieTitle'],
      showNotify: false
    }
  });

  const totalStars = data.reduce((acc, item) => {
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
        { label: 'Phim', href: route.movie.getList.path },
        { label: searchParams.movieTitle ?? 'Chi tiết' },
        { label: 'Đánh giá' }
      ]}
    >
      <ListPageWrapper>
        {loading ? (
          <div className='space-y-4 p-4'>
            <h4 className='skeleton ml-4 h-5 w-20'></h4>
            {Array.from({ length: 8 }).map((_, index) => (
              <ReviewItemSkeleton key={index} />
            ))}
          </div>
        ) : data.length === 0 ? (
          <NoData content='Chưa có đánh giá nào' />
        ) : (
          <div className='mt-4 p-4'>
            <h4 className='-mb-2 ml-2 font-semibold text-black'>
              Đánh giá ({totalElements}) ({((totalStars * 2) / 3)?.toFixed(2)})
            </h4>
            {data.map((item) => (
              <ReviewItem
                key={item.id}
                review={item}
                onDelete={() => handleDeleteReview(item)}
              />
            ))}
            <Activity visible={isFetchingMore}>
              <DotLoading className='mt-4' />
            </Activity>
            <Activity visible={hasMore}>
              <Button
                variant={'ghost'}
                className='mx-auto block'
                onClick={handlers.loadMore}
              >
                Xem thêm ({totalLeft}) đánh giá
              </Button>
            </Activity>
          </div>
        )}
      </ListPageWrapper>
    </PageWrapper>
  );
}
