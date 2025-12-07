'use client';

import { Button } from '@/components/form';
import ReviewItemSkeleton from './review-item-skeleton';
import { ListPageWrapper, PageWrapper } from '@/components/layout';
import { DotLoading } from '@/components/loading';
import { NoData } from '@/components/no-data';
import { apiConfig } from '@/constants';
import { useListBase } from '@/hooks';
import { route } from '@/routes';
import { ReviewResType, ReviewSearchType } from '@/types';
import { useParams } from 'next/navigation';
import ReviewItem from './review-item';
import { useCallback } from 'react';

export default function ReviewList({ queryKey }: { queryKey: string }) {
  const { id: movieId } = useParams<{ id: string }>();

  const {
    data,
    loading,
    handlers,
    isFetchingMore,
    hasMore,
    totalLeft,
    totalElements
  } = useListBase<ReviewResType, ReviewSearchType>({
    apiConfig: apiConfig.review,
    options: {
      objectName: 'đánh giá',
      queryKey,
      defaultHiddenFilters: { movieId },
      showNotify: false,
      useInfiniteScroll: true
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
        { label: 'Đánh giá' }
      ]}
    >
      <ListPageWrapper>
        {data.length === 0 ? (
          <NoData content='Chưa có đánh giá nào' />
        ) : loading ? (
          <div className='space-y-4 p-4'>
            <h4 className='skeleton ml-4 h-5 w-20'></h4>
            {Array.from({ length: 8 }).map((_, index) => (
              <ReviewItemSkeleton key={index} />
            ))}
          </div>
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
            {isFetchingMore && <DotLoading className='mt-4' />}
            {hasMore && (
              <Button
                variant={'ghost'}
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
