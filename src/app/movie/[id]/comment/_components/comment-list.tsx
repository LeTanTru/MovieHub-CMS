'use client';

import './comment.css';
import CommentInput from '@/app/movie/[id]/comment/_components/comment-input';
import { AvatarField, Button, ToolTip } from '@/components/form';
import { ListPageWrapper, PageWrapper } from '@/components/layout';
import { NoData } from '@/components/no-data';
import {
  apiConfig,
  REACTION_TYPE_DISLIKE,
  REACTION_TYPE_LIKE
} from '@/constants';
import { useListBase } from '@/hooks';
import { cn } from '@/lib';
import {
  usePinCommentMutation,
  useVoteCommentMutation
} from '@/queries/comment.query';
import { route } from '@/routes';
import { AuthorInfoType, CommentResType, CommentSearchBodyType } from '@/types';
import { convertUTCToLocal, renderImageUrl } from '@/utils';
import { Pin, Reply, ThumbsDown, ThumbsUp } from 'lucide-react';
import { useParams } from 'next/navigation';
import { useState } from 'react';

const buildCommentTree = (comments: CommentResType[]) => {
  const map: Record<string, CommentResType & { children?: CommentResType[] }> =
    {};
  const roots: (CommentResType & { children?: CommentResType[] })[] = [];

  comments.forEach((c) => {
    map[c.id] = { ...c, children: [] };
  });

  comments.forEach((c) => {
    if (c.parent?.id && map[c.parent.id]) {
      map[c.parent.id].children!.push(map[c.id]);
    } else {
      roots.push(map[c.id]);
    }
  });

  return roots;
};

export default function CommentList({ queryKey }: { queryKey: string }) {
  const { id: movieId } = useParams<{ id: string }>();
  const [likeAnim, setLikeAnim] = useState<string | null>(null);
  const [dislikeAnim, setDislikeAnim] = useState<string | null>(null);

  const voteCommentMutation = useVoteCommentMutation();
  const pinCommentMutation = usePinCommentMutation();

  const { data, loading, handlers, listQuery } = useListBase<
    CommentResType,
    CommentSearchBodyType
  >({
    apiConfig: apiConfig.comment,
    options: {
      objectName: 'bình luận',
      queryKey,
      defaultFilters: { movieId },
      notShowFromSearchParams: ['movieId']
    }
  });

  const tree = buildCommentTree(data);

  const handleLikeComment = async (id: string) => {
    setLikeAnim(id);
    // setTimeout(() => setLikeAnim(null), 300);

    await voteCommentMutation.mutateAsync({
      id,
      type: REACTION_TYPE_LIKE
    });
    // await listQuery.refetch();
  };

  const handleDisikeComment = async (id: string) => {
    setDislikeAnim(id);
    // setTimeout(() => setDislikeAnim(null), 300);

    await voteCommentMutation.mutateAsync({
      id,
      type: REACTION_TYPE_DISLIKE
    });
    // await listQuery.refetch();
  };

  const handlePinComment = async (id: string, isPinned: boolean) => {
    await pinCommentMutation.mutateAsync({
      id,
      isPinned
    });
    await listQuery.refetch();
  };

  const renderComment = (comment: (typeof tree)[0], level: number) => {
    const author = JSON.parse(comment.authorInfo) as AuthorInfoType;

    return (
      <div key={comment.id} style={{ marginLeft: level * 20 }} className='pt-4'>
        <div className='flex items-start space-x-3 rounded-md border p-3 transition hover:bg-gray-50'>
          <AvatarField
            src={renderImageUrl(author.avatarPath)}
            previewClassName='rounded-full'
            size={50}
            alt={author.fullName}
          />
          <div className='flex-1'>
            <div className='flex items-center justify-between'>
              <div className='flex items-center justify-center gap-x-2'>
                <h4 className='font-medium text-gray-800'>{author.fullName}</h4>
                <span className='text-xs text-gray-500'>
                  {convertUTCToLocal(comment.createdDate)}
                </span>
                {comment.isPinned && (
                  <span className='text-xs font-medium text-slate-600 italic'>
                    Đã ghim
                  </span>
                )}
              </div>
              {level === 0 && (
                <div className='flex flex-col items-end justify-center gap-y-5'>
                  <ToolTip title='Ghim bình luận' sideOffset={0}>
                    <Button
                      variant={'ghost'}
                      className={cn('py-0!', {
                        '[&_svg]:fill-blue-600 [&_svg]:text-blue-600':
                          comment.isPinned
                      })}
                      onClick={() =>
                        handlePinComment(comment.id, !comment.isPinned)
                      }
                    >
                      <Pin className='size-5' />
                    </Button>
                  </ToolTip>
                </div>
              )}
            </div>
            <p className='mt-1 text-gray-700'>{comment.content}</p>
            <div className='mt-2 flex items-center gap-x-8 text-sm text-gray-500'>
              <div className='flex items-center gap-x-2'>
                <ToolTip sideOffset={0} title='Thích'>
                  <Button
                    variant={'ghost'}
                    className={cn('px-0!', {
                      'like-pop [&_svg]:fill-blue-400 [&_svg]:stroke-blue-400':
                        likeAnim === comment.id
                    })}
                    onClick={() => handleLikeComment(comment.id)}
                  >
                    <ThumbsUp className='size-5' />
                  </Button>
                </ToolTip>
                {comment.totalLike}
              </div>
              <div className='flex items-center gap-x-2'>
                <ToolTip sideOffset={0} title='Không thích'>
                  <Button
                    variant={'ghost'}
                    className={cn('px-0!', {
                      'dislike-pop [&_svg]:fill-red-400 [&_svg]:stroke-red-400':
                        dislikeAnim === comment.id
                    })}
                    onClick={() => handleDisikeComment(comment.id)}
                  >
                    <ThumbsDown className='size-5' />
                  </Button>
                </ToolTip>
                {comment.totalDislike}
              </div>
              <div>
                <ToolTip sideOffset={0} title='Trả lời'>
                  <Button variant={'ghost'}>
                    <Reply className='size-5' />
                    Trả lời
                  </Button>
                </ToolTip>
              </div>
            </div>
          </div>
        </div>

        {comment.children &&
          comment.children.length > 0 &&
          comment.children.map((child) => renderComment(child, level + 1))}
      </div>
    );
  };

  return (
    <PageWrapper
      breadcrumbs={[
        { label: 'Phim', href: route.movie.getList.path },
        { label: 'Bình luận' }
      ]}
    >
      <ListPageWrapper
      //  reloadButton={handlers.renderReloadButton()}
      >
        <CommentInput queryKey={queryKey} movieId={movieId} />
        {tree.length === 0 ? (
          <NoData content='Chưa có bình luận nào' />
        ) : (
          <div className='-mt-4 px-4 pb-4'>
            {tree.map((c) => renderComment(c, 0))}
          </div>
        )}
      </ListPageWrapper>
    </PageWrapper>
  );
}
