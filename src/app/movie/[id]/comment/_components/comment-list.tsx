'use client';

import './comment.css';
import CommentInput from './comment-input';
import { ListPageWrapper, PageWrapper } from '@/components/layout';
import { NoData } from '@/components/no-data';
import { apiConfig } from '@/constants';
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
import CommentItemSkeleton from './comment-item-skeleton';
import { useQueryClient } from '@tanstack/react-query';
import { Activity } from '@/components/activity';

export default function CommentList({ queryKey }: { queryKey: string }) {
  const { id: movieId } = useParams<{ id: string }>();
  const isMounted = useIsMounted();
  const queryClient = useQueryClient();
  const { searchParams } = useQueryParams<{ movieTitle: string }>();

  const voteListCommentQuery = useVoteListCommentQuery({ movieId });
  const voteList = useMemo(
    () => voteListCommentQuery.data?.data ?? [],
    [voteListCommentQuery.data?.data]
  );

  const voteCommentMutation = useVoteCommentMutation();
  const pinCommentMutation = usePinCommentMutation();

  const hasPermission = useValidatePermission();

  const {
    data,
    loading,
    handlers,
    listQuery,
    isFetchingMore,
    hasMore,
    totalLeft,
    totalElements
  } = useInfiniteListBase<CommentResType, CommentSearchType>({
    apiConfig: apiConfig.comment,
    options: {
      objectName: 'bình luận',
      queryKey,
      defaultFilters: { movieId },
      notShowFromSearchParams: ['movieId'],
      showNotify: false,
      excludeFromQueryFilter: ['movieTitle']
    }
  });

  const voteMap = useMemo(() => {
    const map: Record<string, number> = {};
    voteList.forEach((v) => (map[v.id] = v.type));
    return map;
  }, [voteList]);

  const handleVote = useCallback(
    async (id: string, type: number, onSuccess?: () => void) => {
      await voteCommentMutation.mutateAsync({ id, type });
      await Promise.all([voteListCommentQuery.refetch()]);
      onSuccess?.();
    },
    [voteCommentMutation, voteListCommentQuery]
  );

  const handlePinComment = useCallback(
    async (id: string, isPinned: boolean) => {
      await pinCommentMutation.mutateAsync({ id, isPinned });
      await listQuery.refetch();
    },
    [pinCommentMutation, listQuery]
  );

  const handleDeleteComment = useCallback(
    async (commentToDelete: CommentResType) => {
      handlers.handleDeleteClick(commentToDelete.id, {
        onSuccess: () => {
          if (commentToDelete.parent) {
            queryClient.invalidateQueries({
              queryKey: [queryKey, commentToDelete.parent.id]
            });
          }
        }
      });
    },
    [handlers, queryClient, queryKey]
  );

  const handleReplySuccess = useCallback(async () => {
    await listQuery.refetch();
  }, [listQuery]);

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
        <Activity
          visible={hasPermission({
            requiredPermissions: [apiConfig.comment.create.permissionCode]
          })}
        >
          <CommentInput queryKey={queryKey} movieId={movieId} />
        </Activity>

        {loading ? (
          <div className='space-y-4 px-4'>
            <h4 className='skeleton ml-4 h-5 w-20'></h4>
            {Array.from({ length: 8 }).map((_, index) => (
              <CommentItemSkeleton key={index} />
            ))}
          </div>
        ) : data.length === 0 ? (
          <NoData content='Chưa có bình luận nào' />
        ) : (
          <div className='mt-4 px-4 pb-4'>
            <h4 className='-mb-2 ml-2 font-semibold text-black'>
              Bình luận ({totalElements})
            </h4>
            {renderChildren(data, 0)}
            <Activity visible={isFetchingMore}>
              <DotLoading className='mt-4' />
            </Activity>
            <Activity visible={hasMore}>
              <Button
                variant={'ghost'}
                className='mx-auto block'
                onClick={handlers.loadMore}
              >
                Xem thêm ({totalLeft}) bình luận
              </Button>
            </Activity>
          </div>
        )}
      </ListPageWrapper>
    </PageWrapper>
  );
}
