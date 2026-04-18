'use client';

import './comment.css';
import CommentInput from './comment-input';
import { ListPageWrapper, PageWrapper } from '@/components/layout';
import { NoData } from '@/components/no-data';
import { apiConfig, queryKeys } from '@/constants';
import {
  useInfiniteListBase,
  useIsMounted,
  useQueryParams,
  useValidatePermission
} from '@/hooks';
import {
  usePinCommentMutation,
  useVoteCommentMutation,
  useVoteListCommentQuery
} from '@/queries';
import { route } from '@/routes';
import type { CommentResType, CommentSearchType } from '@/types';
import { useParams } from 'next/navigation';
import { useMemo, useCallback } from 'react';
import CommentItem from './comment-item';
import { DotLoading } from '@/components/loading';
import { Button } from '@/components/form';
import { useQueryClient } from '@tanstack/react-query';

export default function CommentList() {
  const { id: movieId } = useParams<{ id: string }>();
  const isMounted = useIsMounted();
  const queryClient = useQueryClient();
  const { searchParams } = useQueryParams<{ movieTitle: string }>();

  const { data: voteListData, refetch: getVoteList } = useVoteListCommentQuery({
    movieId
  });

  const { mutateAsync: voteCommentMutate } = useVoteCommentMutation();
  const { mutateAsync: pinCommentMutate } = usePinCommentMutation();

  const hasPermission = useValidatePermission();

  const {
    data,
    loading,
    handlers,
    isFetchingMore,
    hasMore,
    totalLeft,
    totalElements
  } = useInfiniteListBase<CommentResType, CommentSearchType>({
    apiConfig: apiConfig.comment,
    options: {
      objectName: 'bình luận',
      queryKey: queryKeys.COMMENT,
      defaultFilters: { movieId },
      notShowFromSearchParams: ['movieId'],
      excludeFromQueryFilter: ['movieTitle'],
      showNotify: false
    }
  });

  const voteMap = useMemo(() => {
    const map: Record<string, number> = {};
    voteListData?.data?.forEach((v) => (map[v.id] = v.type));
    return map;
  }, [voteListData]);

  const handleVote = useCallback(
    async (id: string, type: number, onSuccess?: () => void) => {
      await voteCommentMutate({ id, type });
      await Promise.all([getVoteList()]);
      onSuccess?.();
    },
    [getVoteList, voteCommentMutate]
  );

  const handlePinComment = useCallback(
    async (id: string, isPinned: boolean) => {
      await pinCommentMutate({ id, isPinned });
      handlers.invalidateQueries();
    },
    [pinCommentMutate] // eslint-disable-line react-hooks/exhaustive-deps
  );

  const handleDeleteComment = useCallback(
    async (commentToDelete: CommentResType) => {
      handlers.handleDeleteClick(commentToDelete.id, {
        onSuccess: async () => {
          if (commentToDelete.parent) {
            await queryClient.invalidateQueries({
              queryKey: [
                `${queryKeys.COMMENT}-${commentToDelete.parent.id}-infinite`
              ]
            });
          }
        }
      });
    },
    [handlers, queryClient]
  );

  const handleReplySuccess = useCallback(async () => {
    handlers.invalidateQueries();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const renderChildren = useCallback(
    (list: CommentResType[], level: number, rootId?: string) =>
      list.map((c) => (
        <CommentItem
          key={c.id}
          comment={c}
          level={level}
          rootId={rootId ?? c.id}
          voteMap={voteMap}
          onVote={handleVote}
          onPin={handlePinComment}
          onDelete={() => handleDeleteComment(c)}
          onReplySuccess={handleReplySuccess}
          renderChildren={renderChildren}
        />
      )),
    [
      voteMap,
      handleVote,
      handlePinComment,
      handleDeleteComment,
      handleReplySuccess
    ]
  );

  if (!isMounted) return null;

  return (
    <PageWrapper
      breadcrumbs={[
        { label: 'Phim', href: route.movie.getList.path },
        { label: searchParams.movieTitle ?? 'Chi tiết' },
        { label: 'Bình luận' }
      ]}
    >
      <ListPageWrapper>
        {hasPermission({
          requiredPermissions: [apiConfig.comment.create.permissionCode]
        }) && <CommentInput movieId={movieId} />}

        {loading ? (
          <div className='space-y-4 px-4'>
            <h4 className='skeleton ml-4 h-5 w-20'></h4>
            {Array.from({ length: 8 }).map((_, index) => (
              <CommentItem.Skeleton key={index} />
            ))}
          </div>
        ) : data.length === 0 ? (
          <NoData content='Chưa có bình luận nào' />
        ) : (
          <div className='px-4 pb-4'>
            <h4 className='-mb-2 ml-2 font-semibold text-black'>
              Bình luận ({totalElements})
            </h4>
            {renderChildren(data, 0)}
            {isFetchingMore && <DotLoading className='mt-4' />}
            {hasMore && (
              <Button
                variant='ghost'
                className='mx-auto block'
                onClick={handlers.loadMore}
              >
                Xem thêm ({totalLeft}) bình luận
              </Button>
            )}
          </div>
        )}
      </ListPageWrapper>
    </PageWrapper>
  );
}
