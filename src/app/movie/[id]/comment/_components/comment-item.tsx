'use client';

import React, { memo } from 'react';
import { AvatarField, Button } from '@/components/form';
import {
  Ellipsis,
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
import { AuthorInfoType, CommentResType, CommentSearchType } from '@/types';
import {
  apiConfig,
  COMMENT_STATUS_HIDE,
  COMMENT_STATUS_SHOW,
  DEFAULT_TABLE_PAGE_SIZE,
  GENDER_FEMALE,
  GENDER_MALE,
  queryKeys,
  REACTION_TYPE_DISLIKE,
  REACTION_TYPE_LIKE
} from '@/constants';
import {
  AiOutlineDelete,
  AiOutlineEdit,
  AiOutlineEye,
  AiOutlineEyeInvisible
} from 'react-icons/ai';
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
import CommentReplyForm from './comment-reply-form';
import { motion, AnimatePresence } from 'framer-motion';
import { useCommentStore } from '@/store';
import { useAuth, useInfiniteListQuery, useValidatePermission } from '@/hooks';
import { DotLoading } from '@/components/loading';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { useChangeCommenStatustMutation } from '@/queries';
import { useQueryClient } from '@tanstack/react-query';

type Props = {
  comment: CommentResType & { children?: CommentResType[] };
  level: number;
  voteMap: Record<string, number>;
  rootId: string;
  onVote: (id: string, type: number) => void;
  onPin: (id: string, isPinned: boolean) => void;
  onDelete: () => void;
  onReplySuccess: () => void;
  renderChildren: (
    list: CommentResType[],
    level: number,
    rootId?: string
  ) => React.ReactNode;
};

function CommentItem({
  comment,
  level,
  voteMap,
  rootId,
  onVote,
  onPin,
  onDelete,
  renderChildren,
  onReplySuccess
}: Props) {
  const authorInfo = JSON.parse(comment.authorInfo) as AuthorInfoType;
  const { profile } = useAuth();
  const isAuthor = authorInfo?.id === profile?.id;
  const queryClient = useQueryClient();
  const { hasPermission } = useValidatePermission();

  const isLiked = voteMap[comment.id] === REACTION_TYPE_LIKE;
  const isDisliked = voteMap[comment.id] === REACTION_TYPE_DISLIKE;

  const {
    openParentIds,
    replyingCommentId,
    editingComment,
    setOpenParentIds,
    openReply,
    closeReply,
    setEditingComment
  } = useCommentStore();
  const isActiveParent = openParentIds.includes(comment.id);

  const totalChildren = comment.totalChildren || 0;
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteListQuery<CommentResType, CommentSearchType>({
      apiConfig: apiConfig.comment.getList,
      queryKey: [queryKeys.COMMENT, comment.id],
      enabled: isActiveParent,
      params: {
        parentId: comment.id,
        size: DEFAULT_TABLE_PAGE_SIZE
      }
    });

  const commentList = data?.data?.content || [];
  const commentListSize = commentList.length;
  const isOpen = isActiveParent;

  const changeStatusCommentMutation = useChangeCommenStatustMutation();

  const handleReplySubmit = async () => {
    closeReply();
    onReplySuccess?.();

    const parentIdToInvalidate = level === 0 ? comment.id : rootId;

    await queryClient.invalidateQueries({
      queryKey: [queryKeys.COMMENT, parentIdToInvalidate]
    });
  };

  const handleReplyComment = () => {
    if (replyingCommentId === comment.id) {
      closeReply();
    } else {
      openReply(comment.id);
    }
    setEditingComment(null);
  };

  const handleEditComment = (comment: CommentResType) => {
    setEditingComment(comment);
    closeReply();
  };

  const handleCancelReply = () => {
    closeReply();
    setEditingComment(null);
  };

  const renderContentWithMentions = (content: string) => {
    if (!content) return null;

    let parentInfo = null;
    if (comment.parent)
      parentInfo = JSON.parse(comment.parent.authorInfo) as AuthorInfoType;

    const mention = `@${isAuthor ? authorInfo.fullName : parentInfo?.fullName}`;

    if (!content.includes(mention)) {
      return content;
    }

    const parts = content.split(mention);

    return (
      <>
        {parts.map((part, index) => {
          return (
            <React.Fragment key={index}>
              {part}
              {index < parts.length - 1 && (
                <span className='rounded bg-blue-50 px-1.5 py-0.5 font-semibold text-blue-600'>
                  {mention}
                </span>
              )}
            </React.Fragment>
          );
        })}
      </>
    );
  };

  const handleViewReplies = (parentId: string) => {
    setOpenParentIds((prev) => [...prev, parentId]);
  };

  const handleFetchNextPage = () => {
    fetchNextPage();
  };

  const handleHideReplies = (parentId: string) => {
    setOpenParentIds((prev) => prev.filter((value) => value !== parentId));
  };

  const handleChangeCommentStatus = async (id: string, status: number) => {
    await changeStatusCommentMutation.mutateAsync({
      id,
      status:
        status === COMMENT_STATUS_SHOW
          ? COMMENT_STATUS_HIDE
          : COMMENT_STATUS_SHOW
    });
    queryClient.invalidateQueries({
      queryKey: rootId
        ? [queryKeys.COMMENT, rootId]
        : [`${queryKeys.COMMENT}-infinite`]
    });
  };

  const canCreate = hasPermission({
    requiredPermissions: [apiConfig.comment.create.permissionCode]
  });

  const canUpdate = hasPermission({
    requiredPermissions: [apiConfig.comment.update.permissionCode]
  });

  const canDelete = hasPermission({
    requiredPermissions: [apiConfig.comment.delete.permissionCode]
  });

  const canChangeStatus = hasPermission({
    requiredPermissions: [apiConfig.comment.changeStatus.permissionCode]
  });

  const canPin = hasPermission({
    requiredPermissions: [apiConfig.comment.pin.permissionCode]
  });

  const canVote = hasPermission({
    requiredPermissions: [apiConfig.comment.pin.permissionCode]
  });

  return (
    <div style={{ marginLeft: level * 0 }} className='pt-4'>
      <div className='flex items-start space-x-3 rounded-md border p-3 transition hover:bg-gray-50'>
        <AvatarField
          src={renderImageUrl(authorInfo.avatarPath)}
          previewClassName='rounded-full'
          size={40}
          alt={authorInfo.fullName}
        />

        <div className='flex-1'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-x-2'>
              <h4 className='flex items-center gap-x-2 font-medium text-gray-800'>
                <span className='font-semibold'>{authorInfo.fullName}</span>
                <span>
                  {authorInfo.gender === GENDER_MALE ? (
                    <Mars className='size-4 text-blue-500' />
                  ) : authorInfo.gender === GENDER_FEMALE ? (
                    <Venus className='size-4 text-pink-500' />
                  ) : (
                    <svg
                      stroke='url(#grad)'
                      fill='url(#grad)'
                      strokeWidth='0'
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
                          <stop offset='0%' stopColor='#2b7fff' />
                          <stop offset='100%' stopColor='#ec4899' />
                        </linearGradient>
                      </defs>
                      <path d='M3 12C3 10.067 4.567 8.5 6.5 8.5C7.7035 8.5 8.51959 8.9338 9.19914 9.61336C9.9255 10.3397 10.4851 11.3322 11.1258 12.4856L11.1595 12.5462C11.7605 13.6283 12.4431 14.8573 13.3866 15.8009C14.3946 16.8088 15.7035 17.5 17.5 17.5C20.5376 17.5 23 15.0376 23 12C23 8.96243 20.5376 6.5 17.5 6.5C15.8394 6.5 14.3508 7.2359 13.3423 8.39937C13.7887 9.05406 14.1574 9.70577 14.464 10.2574C15.0681 9.20718 16.2014 8.5 17.5 8.5C19.433 8.5 21 10.067 21 12C21 13.933 19.433 15.5 17.5 15.5C16.2965 15.5 15.4804 15.0662 14.8009 14.3866C14.0745 13.6603 13.5149 12.6678 12.8742 11.5144L12.8405 11.4538C12.2395 10.3717 11.5569 9.14265 10.6134 8.19914C9.60541 7.1912 8.2965 6.5 6.5 6.5C3.46243 6.5 1 8.96243 1 12C1 15.0376 3.46243 17.5 6.5 17.5C8.16056 17.5 9.64923 16.7641 10.6577 15.6006C10.2113 14.9459 9.84262 14.2942 9.53605 13.7426C8.93194 14.7928 7.79856 15.5 6.5 15.5C4.567 15.5 3 13.933 3 12Z'></path>
                    </svg>
                  )}
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

              {comment.status === COMMENT_STATUS_HIDE && (
                <span title='Bình luận đã bị ẩn' className='text-gray-500'>
                  <AiOutlineEyeInvisible className='size-4' />
                </span>
              )}
              {comment.status === COMMENT_STATUS_SHOW && (
                <span
                  title='Bình luận đang hiển thị'
                  className='text-green-500'
                >
                  <AiOutlineEye className='size-4' />
                </span>
              )}
            </div>
            {level === 0 && canPin && (
              <Button
                variant='ghost'
                className={cn('mr-2 size-5! p-0!', {
                  '[&_svg]:fill-blue-600 [&_svg]:text-blue-600':
                    comment.isPinned
                })}
                onClick={() => onPin(comment.id, !comment.isPinned)}
              >
                <Pin className='size-5' />
              </Button>
            )}
          </div>

          <p className='mt-4 text-gray-700'>
            {renderContentWithMentions(comment.content)}
          </p>

          <div className='mt-4 flex items-center gap-x-8 text-sm text-gray-500'>
            {canVote && (
              <div className='flex items-center gap-x-6'>
                <div className='flex items-center gap-x-2'>
                  <Button
                    variant='ghost'
                    className={cn('size-5! p-0!', {
                      'like-pop [&_svg]:fill-blue-400 [&_svg]:stroke-blue-400':
                        isLiked
                    })}
                    onClick={() => onVote(comment.id, REACTION_TYPE_LIKE)}
                  >
                    <ThumbsUp className='size-5' />
                  </Button>
                  {comment.totalLike}
                </div>

                <div className='flex items-center gap-x-2'>
                  <Button
                    variant='ghost'
                    className={cn('size-5! p-0!', {
                      'dislike-pop [&_svg]:fill-red-400 [&_svg]:stroke-red-400':
                        isDisliked
                    })}
                    onClick={() => onVote(comment.id, REACTION_TYPE_DISLIKE)}
                  >
                    <ThumbsDown className='size-5' />
                  </Button>
                  {comment.totalDislike}
                </div>
              </div>
            )}

            {canCreate && (
              <Button
                variant='ghost'
                className='h-5! p-0!'
                onClick={() => handleReplyComment()}
              >
                <Reply className='size-5' /> Trả lời
              </Button>
            )}

            {isAuthor && canUpdate && (
              <Button
                variant='ghost'
                className='text-dodger-blue hover:text-dodger-blue/50 h-5! p-0!'
                onClick={() => handleEditComment(comment)}
              >
                <AiOutlineEdit className='size-5' />
                Chỉnh sửa
              </Button>
            )}

            {(canChangeStatus || canDelete) && (
              <DropdownMenu>
                <DropdownMenuTrigger
                  className='border-none bg-transparent shadow-none'
                  asChild
                >
                  <Button variant='outline'>
                    <Ellipsis />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  sideOffset={0}
                  className='w-56'
                  align='start'
                >
                  <DropdownMenuGroup>
                    <DropdownMenuItem className='cursor-pointer' asChild>
                      {canChangeStatus && (
                        <Button
                          className='h-fit w-full justify-start p-2! transition-all duration-200 ease-linear [&_svg]:size-5!'
                          variant={'ghost'}
                          onClick={() =>
                            handleChangeCommentStatus(
                              comment.id,
                              comment.status
                            )
                          }
                          loading={changeStatusCommentMutation.isPending}
                        >
                          {comment.status === COMMENT_STATUS_SHOW ? (
                            <>
                              <AiOutlineEyeInvisible />
                              Ẩn
                            </>
                          ) : (
                            <>
                              <AiOutlineEye />
                              Hiện
                            </>
                          )}
                        </Button>
                      )}
                    </DropdownMenuItem>
                    <DropdownMenuItem className='cursor-pointer p-0! transition-all duration-200 ease-linear'>
                      {canDelete && (
                        <AlertDialog>
                          <AlertDialogTrigger className='w-full' asChild>
                            <span onClick={(e) => e.stopPropagation()}>
                              <Button className='text-destructive hover:text-destructive/50 h-fit w-full justify-start border-none bg-transparent p-2! shadow-none hover:bg-transparent'>
                                <AiOutlineDelete className='size-5' />
                                Xóa
                              </Button>
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
                                onClick={onDelete}
                                className='bg-dodger-blue hover:bg-dodger-blue/80 w-20 cursor-pointer transition-all duration-200 ease-linear'
                              >
                                Có
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          {isActiveParent && commentListSize > 0 && (
            <>
              {renderChildren(commentList, level + 1, rootId)}
              {isFetchingNextPage && (
                <DotLoading className='mt-4 justify-start bg-transparent' />
              )}
            </>
          )}

          {totalChildren > 0 && (
            <>
              {!isOpen ? (
                <Button
                  variant='ghost'
                  className='mt-2 h-5! p-0! font-medium hover:opacity-70'
                  style={{ marginLeft: level * 40 }}
                  onClick={() => handleViewReplies(comment.id)}
                >
                  Xem tất cả ({totalChildren}) trả lời
                </Button>
              ) : (
                <div
                  className='mt-4 flex items-center gap-x-4'
                  style={{ marginLeft: level * 40 }}
                >
                  {hasNextPage && (
                    <Button
                      variant='ghost'
                      className='h-5! p-0! font-medium hover:opacity-70'
                      onClick={() => handleFetchNextPage()}
                    >
                      Xem thêm ({totalChildren - commentListSize})
                    </Button>
                  )}

                  <Button
                    variant='ghost'
                    className='h-5! p-0! font-medium text-red-500 hover:opacity-70'
                    onClick={() => handleHideReplies(comment.id)}
                  >
                    Ẩn trả lời
                  </Button>
                </div>
              )}
            </>
          )}

          <AnimatePresence initial={false}>
            {(replyingCommentId === comment.id ||
              editingComment?.id === comment.id) && (
              <motion.div
                key='reply'
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.1, ease: 'linear' }}
                className='mt-2'
              >
                <CommentReplyForm
                  parentId={rootId.toString()}
                  movieId={comment.movieId.toString()}
                  defaultMention={`@${authorInfo.fullName}`}
                  queryKey={queryKeys.COMMENT}
                  onSubmitted={handleReplySubmit}
                  onCancel={handleCancelReply}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

export default memo(CommentItem);
