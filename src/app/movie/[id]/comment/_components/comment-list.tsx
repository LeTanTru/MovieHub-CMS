'use client';

import './comment.css';
import CommentInput from './comment-input';
import { ListPageWrapper, PageWrapper } from '@/components/layout';
import { NoData } from '@/components/no-data';
import { apiConfig, objectNames, queryKeys } from '@/constants';
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
import CommentItem from './comment-item';
import { DotLoading } from '@/components/loading';
import { Button } from '@/components/form';
import { invalidateQueries } from '@/utils';
import { useCommentStore } from '@/store';
import { useEffect } from 'react';
import { useShallow } from 'zustand/react/shallow';

export default function CommentList() {
  const { id: movieId } = useParams<{ id: string }>();

  const isMounted = useIsMounted();

  const {
    searchParams: { movieTitle }
  } = useQueryParams<{ movieTitle: string }>();

  const { targetCommentId, targetParentId, setOpenParentIds } = useCommentStore(
    useShallow((s) => ({
      targetCommentId: s.targetCommentId,
      targetParentId: s.targetParentId,
      setOpenParentIds: s.setOpenParentIds
    }))
  );

  const targetRootId = targetParentId || targetCommentId;

  const { data: voteListData, refetch: getVoteList } = useVoteListCommentQuery({
    movieId
  });

  const { mutateAsync: voteCommentMutate } = useVoteCommentMutation();
  const { mutateAsync: pinCommentMutate } = usePinCommentMutation();

  const hasPermission = useValidatePermission();

  const {
    data: commentList,
    loading,
    handlers,
    isFetchingMore,
    hasMore,
    totalLeft,
    totalElements
  } = useInfiniteListBase<CommentResType, CommentSearchType>({
    apiConfig: apiConfig.comment,
    options: {
      objectName: objectNames.COMMENT,
      queryKey: queryKeys.COMMENT,
      defaultFilters: { movieId },
      notShowFromSearchParams: ['movieId'],
      excludeFromQueryFilter: ['movieTitle'],
      showNotify: false
    }
  });

  const voteMap = (() => {
    const map: Record<string, number> = {};
    voteListData?.forEach((v) => (map[v.id] = v.type));
    return map;
  })();

  const handleVote = async (
    id: string,
    type: number,
    onSuccess?: () => void
  ) => {
    await voteCommentMutate({ id, type });
    await Promise.all([getVoteList()]);
    onSuccess?.();
  };

  const handlePinComment = async (id: string, isPinned: boolean) => {
    await pinCommentMutate(
      { id, isPinned },
      {
        onSuccess: (res) => {
          if (res.result) {
            handlers.invalidateQueries();
          }
        }
      }
    );
  };

  const handleDeleteComment = (commentToDelete: CommentResType) => {
    handlers.handleDeleteClick(commentToDelete.id, {
      onSuccess: () => {
        if (commentToDelete.parent) {
          invalidateQueries([
            `${queryKeys.COMMENT}-${commentToDelete.parent.id}-infinite`
          ]);
        }
      }
    });
  };

  const handleReplySuccess = () => handlers.invalidateQueries();

  useEffect(() => {
    if (!targetParentId) return;

    setOpenParentIds((prev) =>
      prev.includes(targetParentId) ? prev : [...prev, targetParentId]
    );
  }, [setOpenParentIds, targetParentId]);

  useEffect(() => {
    if (!targetRootId || loading || isFetchingMore || !hasMore) return;

    if (commentList.some((comment) => comment.id === targetRootId)) return;

    handlers.loadMore();
  }, [commentList, handlers, hasMore, isFetchingMore, loading, targetRootId]);

  const renderChildren = (
    list: CommentResType[],
    level: number,
    rootId?: string
  ) =>
    list.map((c) => (
      <CommentItem
        key={c.id}
        comment={c}
        level={level}
        rootId={rootId || c.id}
        voteMap={voteMap}
        onVote={handleVote}
        onPin={handlePinComment}
        onDelete={() => handleDeleteComment(c)}
        onReplySuccess={handleReplySuccess}
        renderChildren={renderChildren}
      />
    ));

  if (!isMounted) return null;

  return (
    <PageWrapper
      breadcrumbs={[
        { label: 'Phim', href: route.movie.getList.path },
        { label: movieTitle || 'Chi tiết' },
        { label: 'Bình luận' }
      ]}
    >
      <ListPageWrapper>
        {hasPermission({
          requiredPermissions: [apiConfig.comment.create.permissionCode]
        }) && <CommentInput movieId={movieId} />}

        {loading ? (
          <div className='space-y-4 px-4'>
            <div className='skeleton ml-4 h-5 w-20' />
            {Array.from({ length: 8 }).map((_, index) => (
              <CommentItem.Skeleton key={index} />
            ))}
          </div>
        ) : commentList.length === 0 ? (
          <NoData content='Chưa có bình luận nào' />
        ) : (
          <div className='px-4 pb-4'>
            <h4 className='-mb-2 ml-2 font-semibold text-black'>
              Bình luận ({totalElements})
            </h4>
            {renderChildren(commentList, 0)}
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
