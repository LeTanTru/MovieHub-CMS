'use client';

import { type ReactNode, useEffect, useState } from 'react';
import { AvatarField, Button, ToolTip } from '@/components/form';
import { ConfirmModal } from '@/components/modal';
import { Ellipsis, Mars, Pin, Reply, Venus } from 'lucide-react';
import { cn } from '@/lib';
import {
  convertUTCToLocal,
  getLastWord,
  invalidateQueries,
  renderImageUrl,
  timeAgo
} from '@/utils';
import type { CommentResType, CommentSearchType } from '@/types';
import {
  apiConfig,
  COMMENT_STATUS_HIDE,
  COMMENT_STATUS_SHOW,
  DEFAULT_TABLE_PAGE_SIZE,
  GENDER_FEMALE,
  GENDER_MALE,
  objectNames,
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
import CommentForm from './comment-form';
import { m, AnimatePresence } from 'framer-motion';
import { useCommentStore } from '@/store';
import { useAuth, useInfiniteListBase, useValidatePermission } from '@/hooks';
import { DotLoading } from '@/components/loading';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { useChangeCommenStatusMutation } from '@/queries';
import { FaArrowAltCircleDown, FaArrowAltCircleUp } from 'react-icons/fa';
import { useShallow } from 'zustand/react/shallow';
import { Badge } from '@/components/ui/badge';
import { Element, scroller } from 'react-scroll';

type CommentItemProps = {
  comment: CommentResType & { children?: CommentResType[] };
  level: number;
  voteMap: Record<string, number>;
  rootId: string;
  onVote: (id: string, type: number, onSuccess?: () => void) => void;
  onPin: (id: string, isPinned: boolean) => void;
  onDelete: () => void;
  onReplySuccess: () => void;
  renderChildren: (
    list: CommentResType[],
    level: number,
    rootId?: string
  ) => ReactNode;
};

export default function CommentItem({
  comment,
  level,
  voteMap,
  rootId,
  onVote,
  onPin,
  onDelete,
  renderChildren,
  onReplySuccess
}: CommentItemProps) {
  const hasPermission = useValidatePermission();

  const {
    openParentIds,
    replyingComment,
    editingComment,
    targetCommentId,
    targetParentId,
    setOpenParentIds,
    clearScrollTarget,
    openReply,
    closeReply,
    setEditingComment
  } = useCommentStore(
    useShallow((s) => ({
      openParentIds: s.openParentIds,
      replyingComment: s.replyingComment,
      editingComment: s.editingComment,
      targetCommentId: s.targetCommentId,
      targetParentId: s.targetParentId,
      setOpenParentIds: s.setOpenParentIds,
      clearScrollTarget: s.clearScrollTarget,
      openReply: s.openReply,
      closeReply: s.closeReply,
      setEditingComment: s.setEditingComment
    }))
  );

  const isActiveParent = openParentIds.includes(comment.id);

  const totalChildren = comment.totalChildren || 0;

  const {
    data: commentList,
    loading,
    hasMore,
    isFetchingMore,
    handlers
  } = useInfiniteListBase<CommentResType, CommentSearchType>({
    apiConfig: {
      getList: apiConfig.comment.getList
    },
    options: {
      queryKey: `${queryKeys.COMMENT}-${comment.id}`,
      objectName: objectNames.COMMENT,
      pageSize: DEFAULT_TABLE_PAGE_SIZE,
      enabled: isActiveParent,
      defaultFilters: {
        parentId: comment.id
      },
      notShowFromSearchParams: ['parentId'],
      excludeFromQueryFilter: ['movieTitle']
    }
  });

  const authorInfo = comment.author;
  const replyToInfo = comment.replyTo;
  const { profile } = useAuth();
  const isAuthor = authorInfo?.id === profile?.id;

  const isLiked = voteMap[comment.id] === REACTION_TYPE_LIKE;
  const isDisliked = voteMap[comment.id] === REACTION_TYPE_DISLIKE;

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
    requiredPermissions: [apiConfig.comment.vote.permissionCode]
  });

  const commentCount = commentList.length;
  const isOpen = isActiveParent;

  const scrollTargetName = `comment-${comment.id}`; // unique name for scroll target
  const [isScrollTarget, setIsScrollTarget] = useState(false); // state to trigger highlight effect

  const {
    mutateAsync: changeStatusCommentMutate,
    isPending: changeStatusCommentLoading
  } = useChangeCommenStatusMutation();

  const handleReplySubmit = async () => {
    closeReply();
    onReplySuccess?.();

    const parentIdToInvalidate = level === 0 ? comment.id : rootId;

    invalidateQueries([
      `${queryKeys.COMMENT}-${parentIdToInvalidate}-infinite`,
      { parentId: parentIdToInvalidate }
    ]);

    setOpenParentIds((prev) => [...prev, comment.id]);
  };

  const handleReplyComment = () => {
    if (replyingComment?.id === comment.id) {
      closeReply();
    } else {
      openReply(comment);
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

  const renderContentWithMentions = () => {
    if (!replyToInfo?.fullName) return;

    const mention = `@${replyToInfo?.fullName}`;

    return (
      <span className='rounded bg-sky-50 px-1.5 py-0.5 font-semibold text-sky-600'>
        {mention}
      </span>
    );
  };

  const handleViewReplies = (parentId: string) => {
    setOpenParentIds((prev) => [...prev, parentId]);
  };

  const handleFetchNextPage = () => {
    handlers.loadMore();
  };
  const loadMoreReplies = handlers.loadMore;

  const handleHideReplies = (parentId: string) => {
    setOpenParentIds((prev) => prev.filter((value) => value !== parentId));
  };

  const handleChangeCommentStatus = async (id: string, status: number) => {
    await changeStatusCommentMutate({
      id,
      status:
        status === COMMENT_STATUS_SHOW
          ? COMMENT_STATUS_HIDE
          : COMMENT_STATUS_SHOW
    });
    if (comment.parent)
      invalidateQueries([
        `${queryKeys.COMMENT}-${comment.parent.id}-infinite`,
        { parentId: comment.parent.id }
      ]);
    else
      invalidateQueries([
        queryKeys.COMMENT_INFINITE,
        { movieId: comment.movieId }
      ]);
  };

  const handleVote = (id: string, type: number) => {
    onVote(id, type, async () => {
      if (comment.parent)
        invalidateQueries([
          `${queryKeys.COMMENT}-${comment.parent.id}-infinite`,
          { parentId: comment.parent.id }
        ]);
      else
        invalidateQueries([
          queryKeys.COMMENT_INFINITE,
          { movieId: comment.movieId }
        ]);
    });
  };

  useEffect(() => {
    if (targetCommentId !== comment.id) return; // only scroll if this comment is the target

    let clearHighlightTimeout: NodeJS.Timeout | null = null;

    // delay scrolling to ensure the target element is rendered and in place
    const scrollTimeout = setTimeout(() => {
      scroller.scrollTo(scrollTargetName, {
        containerId: 'page-wrapper-scroll-container',
        duration: 500,
        smooth: 'easeInOutQuart',
        offset: -250
      });

      setIsScrollTarget(true);
      clearHighlightTimeout = setTimeout(() => {
        setIsScrollTarget(false);
        clearScrollTarget();
      }, 2000);
    }, 100);

    return () => {
      setIsScrollTarget(false); // Clear highlight if component unmounts or targetCommentId changes

      clearTimeout(scrollTimeout);
      if (clearHighlightTimeout) {
        clearTimeout(clearHighlightTimeout);
      }
    };
  }, [clearScrollTarget, comment.id, scrollTargetName, targetCommentId]);

  useEffect(() => {
    if (!targetCommentId || !targetParentId) return; // only load more if there is a target comment and parent

    if (targetParentId !== comment.id) return; // only load more if this comment is the parent of the target comment

    if (targetCommentId === comment.id) return; // if the target comment is this comment, it means it's already loaded, no need to load more

    if (!isActiveParent || loading || isFetchingMore || !hasMore) return; // only load more if this comment is the active parent and not already loading or fetching more

    if (commentList.some((item) => item.id === targetCommentId)) return; // if the target comment is already in the currently loaded comments, no need to load more

    loadMoreReplies();
  }, [
    comment.id,
    commentList,
    hasMore,
    isActiveParent,
    isFetchingMore,
    loadMoreReplies,
    loading,
    targetCommentId,
    targetParentId
  ]);

  return (
    <Element name={scrollTargetName}>
      <div style={{ marginLeft: level * 0 }} className='pt-4'>
        <div
          className={cn(
            'flex items-start rounded-md border p-3 hover:bg-gray-50',
            {
              'ring-main-color ring-2 transition-all duration-200 ease-linear':
                isScrollTarget
            }
          )}
        >
          <AvatarField
            src={renderImageUrl(authorInfo.avatarPath)}
            previewClassName='rounded-full'
            size={40}
            alt={getLastWord(authorInfo.fullName)}
            className='mr-4'
          />

          <div className='flex-1'>
            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-x-2'>
                <h4 className='flex items-center gap-x-2 font-medium text-gray-800'>
                  <span className='font-semibold'>{authorInfo.fullName}</span>
                  <span>
                    {authorInfo.gender === GENDER_MALE ? (
                      <Mars className='size-4 text-sky-500' />
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

                {comment.status === COMMENT_STATUS_HIDE && (
                  <span title='Bình luận đã bị ẩn' className='text-gray-500'>
                    <AiOutlineEyeInvisible className='size-4' />
                  </span>
                )}

                {comment.status === COMMENT_STATUS_SHOW && (
                  <span
                    title='Bình luận đang hiển thị'
                    className='text-emerald-500'
                  >
                    <AiOutlineEye className='size-4' />
                  </span>
                )}

                {comment.isPinned && (
                  <span className='text-xs font-medium text-slate-600 italic'>
                    Đã ghim
                  </span>
                )}

                {comment.movieItem &&
                  (comment.movieItem.parent ? (
                    <Badge
                      variant='outline'
                      className='border-slate-200 text-xs font-medium'
                    >
                      Phần {comment.movieItem.parent.label} - Tập&nbsp;
                      {comment.movieItem.label}
                    </Badge>
                  ) : (
                    <Badge
                      variant='outline'
                      className='border-slate-200 text-xs font-medium'
                    >
                      Phần&nbsp;{comment.movieItem.label}
                    </Badge>
                  ))}
              </div>
              {level === 0 && canPin && (
                <Button
                  variant='ghost'
                  className={cn('mr-2 size-5! p-0!', {
                    '[&_svg]:fill-sky-600 [&_svg]:text-sky-600':
                      comment.isPinned
                  })}
                  onClick={() => onPin(comment.id, !comment.isPinned)}
                >
                  <Pin
                    className={cn(
                      'size-5 transition-all duration-200 ease-linear',
                      {
                        'rotate-45': comment.isPinned
                      }
                    )}
                  />
                </Button>
              )}
            </div>

            <p className='mt-4 break-all text-gray-700'>
              {renderContentWithMentions()}&nbsp;{comment.content}
            </p>

            <div className='mt-4 flex items-center gap-x-8 text-sm text-gray-500'>
              {canVote && (
                <div className='flex items-center gap-x-6'>
                  <div className='flex items-center gap-x-2'>
                    <ToolTip title='Thích'>
                      <Button
                        variant='ghost'
                        className={cn('size-5! p-0! hover:text-sky-500', {
                          'like-pop [&_svg]:fill-sky-500 [&_svg]:stroke-sky-500':
                            isLiked
                        })}
                        onClick={() =>
                          handleVote(comment.id, REACTION_TYPE_LIKE)
                        }
                      >
                        <FaArrowAltCircleUp className='size-5' />
                      </Button>
                    </ToolTip>
                    {comment.totalLike}
                  </div>

                  <div className='flex items-center gap-x-2'>
                    <ToolTip title='Không thích'>
                      <Button
                        variant='ghost'
                        className={cn('size-5! p-0! hover:text-rose-500', {
                          'dislike-pop [&_svg]:fill-rose-500 [&_svg]:stroke-rose-500':
                            isDisliked
                        })}
                        onClick={() =>
                          handleVote(comment.id, REACTION_TYPE_DISLIKE)
                        }
                      >
                        <FaArrowAltCircleDown className='size-5' />
                      </Button>
                    </ToolTip>
                    {comment.totalDislike}
                  </div>
                </div>
              )}

              {canCreate && (
                <Button
                  variant='ghost'
                  className='h-5! p-0! hover:bg-transparent'
                  onClick={() => handleReplyComment()}
                >
                  <Reply className='size-5' /> Trả lời
                </Button>
              )}

              {isAuthor && canUpdate && (
                <Button
                  variant='ghost'
                  className='text-main-color hover:text-main-color/50 h-5! p-0! hover:bg-transparent'
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
                            className='hover:bg-accent/80 h-fit w-full justify-start p-2! transition-all duration-200 ease-linear [&_svg]:size-5!'
                            variant='ghost'
                            onClick={() =>
                              handleChangeCommentStatus(
                                comment.id,
                                comment.status
                              )
                            }
                            loading={changeStatusCommentLoading}
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
                          <ConfirmModal
                            message='Bạn có chắc chắn muốn xóa bình luận này không ?'
                            onConfirm={onDelete}
                            trigger={
                              <Button
                                variant='ghost'
                                className='text-destructive hover:text-destructive/50 h-fit w-full justify-start border-none bg-transparent p-2! shadow-none hover:bg-transparent'
                              >
                                <AiOutlineDelete className='size-5' />
                                Xóa
                              </Button>
                            }
                          />
                        )}
                      </DropdownMenuItem>
                    </DropdownMenuGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>

            <AnimatePresence initial={false}>
              {(replyingComment?.id === comment.id ||
                editingComment?.id === comment.id) && (
                <m.div
                  key='reply'
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.1, ease: 'linear' }}
                  className='mt-2'
                >
                  <CommentForm
                    parentId={rootId.toString()}
                    movieId={comment.movieId.toString()}
                    defaultMention={`@${authorInfo.fullName}`}
                    onSubmitted={handleReplySubmit}
                    onCancel={handleCancelReply}
                  />
                </m.div>
              )}
            </AnimatePresence>

            {isActiveParent && commentCount > 0 && (
              <>
                {renderChildren(commentList, level + 1, rootId)}
                {isFetchingMore && (
                  <DotLoading className='mt-4 justify-start bg-transparent' />
                )}
              </>
            )}

            {totalChildren > 0 && (
              <>
                {!isOpen ? (
                  <Button
                    variant='ghost'
                    className='mt-2 h-5! p-0! font-medium hover:bg-transparent hover:opacity-70'
                    style={{ marginLeft: level * 40 }}
                    onClick={() => handleViewReplies(comment.id)}
                  >
                    Xem tất cả ({totalChildren}) trả lời
                  </Button>
                ) : loading ? (
                  <DotLoading className='mt-4 justify-start bg-transparent' />
                ) : (
                  <div
                    className='mt-4 flex items-center gap-x-4'
                    style={{ marginLeft: level * 40 }}
                  >
                    {hasMore && (
                      <Button
                        variant='ghost'
                        className='h-5! p-0! font-medium hover:bg-transparent hover:opacity-70'
                        onClick={handleFetchNextPage}
                      >
                        Xem thêm ({totalChildren - commentCount})
                      </Button>
                    )}

                    <Button
                      variant='ghost'
                      className='h-5! p-0! font-medium text-rose-500 hover:bg-transparent hover:opacity-70'
                      onClick={() => handleHideReplies(comment.id)}
                    >
                      Ẩn trả lời
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </Element>
  );
}

CommentItem.Skeleton = function () {
  return (
    <div className='gap- flex h-30 w-full items-start rounded-md border p-3 transition hover:bg-gray-50'>
      <div className='skeleton size-10 rounded-full!'></div>
      <div className='flex-1'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-x-2'>
            <h4 className='flex items-center gap-x-2 font-medium text-gray-800'>
              <div className='skeleton h-5 w-30 font-semibold'></div>
              <div className='skeleton size-5'></div>
              <div className='skeleton h-5 w-20'></div>
              <div className='skeleton h-5 w-10'></div>
              <div className='skeleton size-5'></div>
            </h4>
          </div>
          <div className='skeleton mr-2 size-5'></div>
        </div>
        <p className='skeleton mt-4 h-5 w-100 text-gray-700'></p>

        <div className='mt-4 flex items-center gap-x-4 text-sm text-gray-500'>
          <div className='skeleton h-5 w-10'></div>
          <div className='skeleton h-5 w-10'></div>
          <div className='skeleton h-5 w-10'></div>
          <div className='skeleton h-5 w-10'></div>
          <div className='skeleton h-5 w-10'></div>
        </div>
      </div>
    </div>
  );
};
