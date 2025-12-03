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
} from '@/queries/comment.query';
import { route } from '@/routes';
import { CommentResType, CommentSearchBodyType } from '@/types';
import { useParams } from 'next/navigation';
import { useMemo, useCallback } from 'react';
import CommentItem from './comment-item';

const buildCommentTree = (comments: CommentResType[]) => {
  const map: Record<string, any> = {};
  const roots: any[] = [];

  for (const c of comments) map[c.id] = { ...c, children: [] };

  for (const c of comments) {
    if (c.parent?.id && map[c.parent.id]) {
      map[c.parent.id].children.push(map[c.id]);
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

  const { data, handlers, listQuery } = useListBase<
    CommentResType,
    CommentSearchBodyType
  >({
    apiConfig: apiConfig.comment,
    options: {
      objectName: 'bình luận',
      queryKey,
      defaultFilters: { movieId },
      notShowFromSearchParams: ['movieId'],
      showNotify: false
    }
  });

  const tree = useMemo(() => buildCommentTree(data), [data]);

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
    (list: CommentResType[], level: number) =>
      list.map((c) => (
        <CommentItem
          key={c.id}
          comment={c}
          level={level}
          voteMap={voteMap}
          onVote={handleVote}
          onPin={handlePinComment}
          onDelete={handleDeleteComment}
          renderChildren={renderChildren}
          onReplySuccess={handleReplySuccess}
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
    >
      <ListPageWrapper>
        <CommentInput queryKey={queryKey} movieId={movieId} />

        {tree.length === 0 ? (
          <NoData content='Chưa có bình luận nào' />
        ) : (
          <div className='-mt-4 px-4 pb-4'>{renderChildren(tree, 0)}</div>
        )}
      </ListPageWrapper>
    </PageWrapper>
  );
}
