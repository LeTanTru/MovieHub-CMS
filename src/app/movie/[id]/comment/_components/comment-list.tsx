'use client';
import './comment.css';
import CommentInput from '@/app/movie/[id]/comment/_components/comment-input';
import { ListPageWrapper, PageWrapper } from '@/components/layout';
import { NoData } from '@/components/no-data';
import { apiConfig } from '@/constants';
import { useListBase } from '@/hooks';
import {
  usePinCommentMutation,
  useVoteCommentMutation,
  useVoteListCommentQuery
} from '@/queries';
import { route } from '@/routes';
import { CommentResType, CommentSearchType } from '@/types';
import { useParams } from 'next/navigation';
import { useMemo, useCallback } from 'react';
import CommentItem from './comment-item';
import { DotLoading } from '@/components/loading';

const buildCommentTree = (comments: CommentResType[]) => {
  const map: Record<string, CommentResType & { children?: CommentResType[] }> =
    {};
  const roots: (CommentResType & { children?: CommentResType[] })[] = [];
  for (const c of comments) map[c.id] = { ...c, children: [] };
  for (const c of comments) {
    if (c.parent?.id && map[c.parent.id]) {
      map[c.parent.id].children?.push(map[c.id]);
    } else {
      roots.push(map[c.id]);
    }
  }
  return roots;
};

export default function CommentList({ queryKey }: { queryKey: string }) {
  const { id: movieId } = useParams<{ id: string }>();

  const voteListCommentQuery = useVoteListCommentQuery({ movieId });
  const voteList = useMemo(
    () => voteListCommentQuery.data?.data ?? [],
    [voteListCommentQuery.data?.data]
  );

  const voteCommentMutation = useVoteCommentMutation();
  const pinCommentMutation = usePinCommentMutation();

  const { data, isFetchingMore, handlers, listQuery } = useListBase<
    CommentResType,
    CommentSearchType
  >({
    apiConfig: apiConfig.comment,
    options: {
      objectName: 'bình luận',
      queryKey,
      defaultFilters: { movieId },
      notShowFromSearchParams: ['movieId', 'parentId', 'page', 'size'],
      showNotify: false
    }
  });

  const voteMap = useMemo(() => {
    const map: Record<string, number> = {};
    voteList.forEach((v) => (map[v.id] = v.type));
    return map;
  }, [voteList]);

  const handleVote = useCallback(
    async (id: string, type: number) => {
      await voteCommentMutation.mutateAsync({ id, type });
      await Promise.all([listQuery.refetch(), voteListCommentQuery.refetch()]);
    },
    [voteCommentMutation, listQuery, voteListCommentQuery]
  );

  const handlePinComment = useCallback(
    async (id: string, isPinned: boolean) => {
      await pinCommentMutation.mutateAsync({ id, isPinned });
      await listQuery.refetch();
    },
    [pinCommentMutation, listQuery]
  );

  const handleDeleteComment = useCallback(
    async (id: string) => {
      handlers.handleDeleteClick(id);
    },
    [handlers]
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
          onDelete={handleDeleteComment}
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

  return (
    <PageWrapper
      breadcrumbs={[
        { label: 'Phim', href: route.movie.getList.path },
        { label: 'Bình luận' }
      ]}
      onScroll={handlers.handleScrollLoadMore}
    >
      <ListPageWrapper>
        <CommentInput queryKey={queryKey} movieId={movieId} />

        {data.length === 0 ? (
          <NoData content='Chưa có bình luận nào' />
        ) : (
          <div className='px-4 pb-4'>
            <h4 className='-mb-2 ml-2 font-semibold text-black'>
              Bình luận ({data.length})
            </h4>
            {renderChildren(data, 0)}
            {isFetchingMore && <DotLoading className='mt-4' />}
          </div>
        )}
      </ListPageWrapper>
    </PageWrapper>
  );
}
