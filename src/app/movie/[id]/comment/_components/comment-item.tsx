'use client';

import { memo } from 'react';
import { AvatarField, Button, ToolTip } from '@/components/form';
import { Mars, Pin, Reply, ThumbsDown, ThumbsUp, Venus } from 'lucide-react';
import { cn } from '@/lib';
import { convertUTCToLocal, renderImageUrl, timeAgo } from '@/utils';
import { AuthorInfoType, CommentResType } from '@/types';
import {
  GENDER_MALE,
  REACTION_TYPE_DISLIKE,
  REACTION_TYPE_LIKE
} from '@/constants';

type Props = {
  comment: CommentResType & { children?: CommentResType[] };
  level: number;
  voteMap: Record<string, number>;
  onVote: (id: string, type: number) => void;
  onPin: (id: string, isPinned: boolean) => void;
  renderChildren: (list: CommentResType[], level: number) => React.ReactNode;
};

function CommentItem({
  comment,
  level,
  voteMap,
  onVote,
  onPin,
  renderChildren
}: Props) {
  const author = JSON.parse(comment.authorInfo) as AuthorInfoType;

  const isLiked = voteMap[comment.id] === REACTION_TYPE_LIKE;
  const isDisliked = voteMap[comment.id] === REACTION_TYPE_DISLIKE;

  return (
    <div style={{ marginLeft: level * 40 }} className='pt-4'>
      <div className='flex items-start space-x-3 rounded-md border p-3 transition hover:bg-gray-50'>
        <AvatarField
          src={renderImageUrl(author.avatarPath)}
          previewClassName='rounded-full'
          size={50}
          alt={author.fullName}
        />

        <div className='flex-1'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-x-2'>
              <h4 className='flex items-center gap-x-2 font-medium text-gray-800'>
                {author.fullName}
                <span>
                  {author.gender ? (
                    author.gender === GENDER_MALE ? (
                      <Mars className='size-5 text-blue-500' />
                    ) : (
                      <Venus className='size-5 text-pink-500' />
                    )
                  ) : null}
                </span>
              </h4>

              <span
                className='text-xs text-gray-500'
                title={convertUTCToLocal(comment.createdDate)}
              >
                {timeAgo(comment.createdDate)}
              </span>
              {comment.isPinned && (
                <span className='text-xs font-medium text-slate-600 italic'>
                  Đã ghim
                </span>
              )}
            </div>

            {level === 0 && (
              <ToolTip title='Ghim bình luận'>
                <Button
                  variant='ghost'
                  className={cn({
                    '[&_svg]:fill-blue-600 [&_svg]:text-blue-600':
                      comment.isPinned
                  })}
                  onClick={() => onPin(comment.id, !comment.isPinned)}
                >
                  <Pin className='size-5' />
                </Button>
              </ToolTip>
            )}
          </div>

          <p className='mt-1 text-gray-700'>{comment.content}</p>

          <div className='mt-2 flex items-center gap-x-8 text-sm text-gray-500'>
            <div className='flex items-center gap-x-2'>
              <ToolTip title='Thích'>
                <Button
                  variant='ghost'
                  className={cn('px-0!', {
                    'like-pop [&_svg]:fill-blue-400 [&_svg]:stroke-blue-400':
                      isLiked
                  })}
                  onClick={() => onVote(comment.id, REACTION_TYPE_LIKE)}
                >
                  <ThumbsUp className='size-5' />
                </Button>
              </ToolTip>
              {comment.totalLike}
            </div>

            <div className='flex items-center gap-x-2'>
              <ToolTip title='Không thích'>
                <Button
                  variant='ghost'
                  className={cn('px-0!', {
                    'dislike-pop [&_svg]:fill-red-400 [&_svg]:stroke-red-400':
                      isDisliked
                  })}
                  onClick={() => onVote(comment.id, REACTION_TYPE_DISLIKE)}
                >
                  <ThumbsDown className='size-5' />
                </Button>
              </ToolTip>
              {comment.totalDislike}
            </div>

            <ToolTip title='Trả lời'>
              <Button variant='ghost'>
                <Reply className='size-5' /> Trả lời
              </Button>
            </ToolTip>
          </div>
        </div>
      </div>

      {comment.children?.length
        ? renderChildren(comment.children, level + 1)
        : null}
    </div>
  );
}

export default memo(CommentItem);
