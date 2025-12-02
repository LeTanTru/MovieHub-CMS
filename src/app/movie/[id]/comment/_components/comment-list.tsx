'use client';

import CommentInput from '@/app/movie/[id]/comment/_components/comment-input';
import { AvatarField, Button, ToolTip } from '@/components/form';
import { ListPageWrapper, PageWrapper } from '@/components/layout';
import { List, ListItem } from '@/components/list';
import { NoData } from '@/components/no-data';
import { apiConfig } from '@/constants';
import { useListBase } from '@/hooks';
import { route } from '@/routes';
import { CommentResType, CommentSearchBodyType } from '@/types';
import { convertUTCToLocal, renderImageUrl } from '@/utils';
import { Pin, ThumbsDown, ThumbsUp } from 'lucide-react';
import { useParams } from 'next/navigation';

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

  const { data, loading, handlers } = useListBase<
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

  const renderComment = (comment: (typeof tree)[0], level: number) => (
    <ListItem
      key={comment.id}
      style={{ marginLeft: level * 20 }}
      className='pb-4'
    >
      <div className='flex items-start space-x-3 rounded-md border p-3 transition hover:bg-gray-50'>
        <AvatarField
          src={renderImageUrl(comment.author.avatarPath)}
          previewClassName='rounded-full'
          size={50}
          alt={comment.author.fullName}
        />
        <div className='flex-1'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center justify-center gap-x-2'>
              <h4 className='font-medium text-gray-800'>
                {comment.author.fullName}
              </h4>
              <span className='text-xs text-gray-500'>
                {convertUTCToLocal(comment.createdDate)}
              </span>
            </div>
            <div className='flex flex-col items-end justify-center gap-y-5'>
              <ToolTip title='Ghim bình luận' sideOffset={0}>
                <Button variant={'ghost'} className='py-0!'>
                  <Pin className='size-5' />
                </Button>
              </ToolTip>
            </div>
          </div>
          <p className='mt-1 text-gray-700'>{comment.content}</p>
          <div className='mt-2 flex items-center space-x-8 text-sm text-gray-500'>
            <div className='flex items-center gap-x-2'>
              <ToolTip sideOffset={0} title='Thích'>
                <Button variant={'ghost'} className='px-0!'>
                  <ThumbsUp className='size-4' />
                </Button>
              </ToolTip>
              {comment.totalLike}
            </div>
            <div className='flex items-center gap-x-2'>
              <ToolTip sideOffset={0} title='Không thích'>
                <Button variant={'ghost'} className='px-0!'>
                  <ThumbsDown className='size-4' />
                </Button>
              </ToolTip>
              {comment.totalDislike}
            </div>
            {comment.isPinned && (
              <span className='font-medium text-blue-500'>Pinned</span>
            )}
          </div>
        </div>
      </div>

      {comment.children &&
        comment.children.length > 0 &&
        comment.children.map((child) => renderComment(child, level + 1))}
    </ListItem>
  );

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
          <List className='px-4'>{tree.map((c) => renderComment(c, 0))}</List>
        )}
      </ListPageWrapper>
    </PageWrapper>
  );
}
