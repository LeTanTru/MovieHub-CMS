'use client';

import { memo, useState } from 'react';
import { AvatarField, Button, ToolTip } from '@/components/form';
import {
  Info,
  Mars,
  Pin,
  Reply,
  ThumbsDown,
  ThumbsUp,
  Venus
} from 'lucide-react';
import { cn } from '@/lib';
import { convertUTCToLocal, renderImageUrl, timeAgo } from '@/utils';
import { AuthorInfoType, CommentResType } from '@/types';
import {
  GENDER_FEMALE,
  GENDER_MALE,
  REACTION_TYPE_DISLIKE,
  REACTION_TYPE_LIKE
} from '@/constants';
import { AiOutlineDelete } from 'react-icons/ai';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from '@/components/ui/alert-dialog';
import CommentReplyForm from '@/app/movie/[id]/comment/_components/comment-reply-form';

type Props = {
  comment: CommentResType & { children?: CommentResType[] };
  level: number;
  voteMap: Record<string, number>;
  onVote: (id: string, type: number) => void;
  onPin: (id: string, isPinned: boolean) => void;
  onDelete: (id: string) => void;
  onReplySuccess: () => void;
  renderChildren: (list: CommentResType[], level: number) => React.ReactNode;
};

function CommentItem({
  comment,
  level,
  voteMap,
  onVote,
  onPin,
  onDelete,
  renderChildren,
  onReplySuccess
}: Props) {
  const author = JSON.parse(comment.authorInfo) as AuthorInfoType;

  const isLiked = voteMap[comment.id] === REACTION_TYPE_LIKE;
  const isDisliked = voteMap[comment.id] === REACTION_TYPE_DISLIKE;

  const [showReply, setShowReply] = useState(false);

  const handleReplySubmit = () => {
    onReplySuccess?.();
    setShowReply(false);
  };

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
              <h4 className='flex items-center gap-x-1 font-medium text-gray-800'>
                {author.fullName}
                {author.gender && (
                  <span>
                    {author.gender === GENDER_MALE ? (
                      <Mars className='size-4 text-blue-500' />
                    ) : author.gender === GENDER_FEMALE ? (
                      <Venus className='size-4 text-pink-500' />
                    ) : (
                      <svg
                        stroke='url(#grad)'
                        fill='url(#grad)'
                        stroke-width='0'
                        viewBox='0 0 24 24'
                        className='size-4'
                        height='1em'
                        width='1em'
                        xmlns='http://www.w3.org/2000/svg'
                      >
                        <defs>
                          <linearGradient
                            id='grad'
                            x1='0%'
                            y1='0%'
                            x2='100%'
                            y2='100%'
                          >
                            <stop offset='0%' stop-color='#2b7fff' />
                            <stop offset='100%' stop-color='#ec4899' />
                          </linearGradient>
                        </defs>
                        <path d='M3 12C3 10.067 4.567 8.5 6.5 8.5C7.7035 8.5 8.51959 8.9338 9.19914 9.61336C9.9255 10.3397 10.4851 11.3322 11.1258 12.4856L11.1595 12.5462C11.7605 13.6283 12.4431 14.8573 13.3866 15.8009C14.3946 16.8088 15.7035 17.5 17.5 17.5C20.5376 17.5 23 15.0376 23 12C23 8.96243 20.5376 6.5 17.5 6.5C15.8394 6.5 14.3508 7.2359 13.3423 8.39937C13.7887 9.05406 14.1574 9.70577 14.464 10.2574C15.0681 9.20718 16.2014 8.5 17.5 8.5C19.433 8.5 21 10.067 21 12C21 13.933 19.433 15.5 17.5 15.5C16.2965 15.5 15.4804 15.0662 14.8009 14.3866C14.0745 13.6603 13.5149 12.6678 12.8742 11.5144L12.8405 11.4538C12.2395 10.3717 11.5569 9.14265 10.6134 8.19914C9.60541 7.1912 8.2965 6.5 6.5 6.5C3.46243 6.5 1 8.96243 1 12C1 15.0376 3.46243 17.5 6.5 17.5C8.16056 17.5 9.64923 16.7641 10.6577 15.6006C10.2113 14.9459 9.84262 14.2942 9.53605 13.7426C8.93194 14.7928 7.79856 15.5 6.5 15.5C4.567 15.5 3 13.933 3 12Z'></path>
                      </svg>
                    )}
                  </span>
                )}
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

          <div className='mt-2 flex items-center gap-x-6 text-sm text-gray-500'>
            <div className='flex items-center gap-x-6'>
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
            </div>

            <ToolTip title='Trả lời'>
              <Button
                variant='ghost'
                onClick={() => setShowReply((prev) => !prev)}
              >
                <Reply className='size-5' /> Trả lời
              </Button>
            </ToolTip>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <span>
                  <ToolTip title={`Xóa bình luận`} sideOffset={0}>
                    <Button className='text-destructive border-none bg-transparent px-2! shadow-none hover:bg-transparent'>
                      <AiOutlineDelete className='size-4' />
                      Xóa
                    </Button>
                  </ToolTip>
                </span>
              </AlertDialogTrigger>
              <AlertDialogContent className='data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-0! data-[state=closed]:slide-out-to-top-0! data-[state=open]:slide-in-from-left-0! data-[state=open]:slide-in-from-top-0! top-[30%] max-w-md p-4'>
                <AlertDialogHeader>
                  <AlertDialogTitle className='content flex flex-nowrap items-center gap-2 text-sm font-normal'>
                    <Info className='size-8 fill-orange-500 stroke-white' />
                    Bạn có chắc chắn muốn xóa bình luận này không ?
                  </AlertDialogTitle>
                  <AlertDialogDescription></AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel asChild>
                    <Button
                      onClick={(e) => e.stopPropagation()}
                      variant='outline'
                      className='w-20 border-red-500 text-red-500 transition-all duration-200 ease-linear hover:bg-transparent hover:text-red-500/80'
                    >
                      Không
                    </Button>
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => onDelete(comment.id)}
                    className='bg-dodger-blue hover:bg-dodger-blue/80 w-20 cursor-pointer transition-all duration-200 ease-linear'
                  >
                    Có
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
          {showReply && (
            <div className='mt-2'>
              <CommentReplyForm
                parentId={comment.id.toString()}
                movieId={comment.movieId.toString()}
                queryKey='comments'
                onSubmitted={handleReplySubmit}
              />
            </div>
          )}
        </div>
      </div>

      {comment.children?.length
        ? renderChildren(comment.children, level + 1)
        : null}
    </div>
  );
}

export default memo(CommentItem);
