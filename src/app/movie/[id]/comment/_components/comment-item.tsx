'use client';

import { type ReactNode, useCallback, useEffect, useState } from 'react';
import { AvatarField } from '@/components/form';
import { cn } from '@/lib';
import {
  getLastWord,
  invalidateQueries,
  notify,
  parseJSON,
  renderImageUrl
} from '@/utils';
import type { CommentResType, CommentSearchType, ToxicSpan } from '@/types';
import {
  AVATAR_SIZE_COMMENT,
  apiConfig,
  COMMENT_STATUS_HIDE,
  COMMENT_STATUS_SHOW,
  DEFAULT_TABLE_PAGE_SIZE,
  objectNames,
  queryKeys,
  REACTION_TYPE_DISLIKE,
  REACTION_TYPE_LIKE
} from '@/constants';
import { useAuth, useInfiniteListBase, useValidatePermission } from '@/hooks';
import { useChangeCommenStatusMutation } from '@/queries';
import { Element, scroller } from 'react-scroll';
import { logger } from '@/logger';
import { CommentAction } from './comment-action';
import { CommentContent } from './comment-content';
import { CommentHeader } from './comment-header';
import { CommentReplyForm } from './comment-reply-form';
import { CommentReplyList } from './comment-reply-list';
import { CommentItemSkeleton } from './comment-item-skeleton';

type CommentItemProps = {
  comment: CommentResType & {
    children?: CommentResType[];
  };
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
  openReply: (comment: CommentResType) => void;
  closeReply: () => void;
  setEditingComment: (comment: CommentResType | null) => void;
  setOpenParentIds: (fn: (prev: string[]) => string[]) => void;
  clearScrollTarget: () => void;
  openParentIds: string[];
  replyingComment: CommentResType | null;
  editingComment: CommentResType | null;
  targetCommentId: string | null;
  targetParentId: string | null;
};

export function CommentItem({
  comment,
  level,
  voteMap,
  rootId,
  onVote,
  onPin,
  onDelete,
  renderChildren,
  onReplySuccess,
  openReply,
  closeReply,
  setEditingComment,
  setOpenParentIds,
  clearScrollTarget,
  openParentIds,
  replyingComment,
  editingComment,
  targetCommentId,
  targetParentId
}: CommentItemProps) {
  const hasPermission = useValidatePermission();

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
      notShowFromSearchParams: ['parentId']
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

  const isHidden = comment.status === COMMENT_STATUS_HIDE;
  const toxicSpans = comment.toxicSpans
    ? parseJSON<ToxicSpan[]>(comment.toxicSpans) || []
    : [];
  const hasToxicSpans = toxicSpans.length > 0;
  const [isVisible, setIsVisible] = useState(false);
  const canViewHiddenContent = isHidden || !!hasToxicSpans;
  const isBlurWholeContent = isHidden && !isVisible && !hasToxicSpans;

  const {
    mutate: changeStatusCommentMutate,
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

  const renderMention = () => {
    if (!replyToInfo?.fullName) return;

    const mention = `@${replyToInfo?.fullName}`;

    return (
      <span className='rounded bg-sky-50 px-1.5 py-0.5 font-semibold text-sky-600'>
        {mention}&nbsp;
      </span>
    );
  };

  const renderContent = () => {
    const content = comment.content;

    if (!hasToxicSpans)
      return (
        <>
          {renderMention()}
          {comment.content}
        </>
      );

    const result: ReactNode[] = [];
    let lastIndex = 0;

    toxicSpans.forEach((span, index) => {
      const start = Math.min(Math.max(span.start, lastIndex), content.length);
      const end = Math.min(Math.max(span.end, start), content.length);

      if (start > lastIndex) {
        result.push(content.slice(lastIndex, start));
      }

      if (start === end) {
        lastIndex = start;
        return;
      }

      result.push(
        <span
          className={cn({ 'blur-xs select-none': !isVisible })}
          key={`${start}-${end}-${index}`}
        >
          {content.slice(start, end)}
        </span>
      );

      lastIndex = end;
    });

    result.push(content.slice(lastIndex));

    return (
      <>
        {renderMention()}
        {result}
      </>
    );
  };

  const handleViewReplies = (parentId: string) => {
    setOpenParentIds((prev) => [...prev, parentId]);
  };

  const handleFetchNextPage = useCallback(() => {
    handlers.loadMore();
  }, [handlers]);

  const handleViewContent = () => {
    setIsVisible((prev) => !prev);
  };

  const handleHideReplies = (parentId: string) => {
    setOpenParentIds((prev) => prev.filter((value) => value !== parentId));
  };

  const handleChangeCommentStatus = (id: string, status: number) => {
    changeStatusCommentMutate(
      {
        id,
        status:
          status === COMMENT_STATUS_SHOW
            ? COMMENT_STATUS_HIDE
            : COMMENT_STATUS_SHOW
      },
      {
        onSuccess: (res) => {
          if (res.result) {
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

            notify.success(
              `${comment.status === COMMENT_STATUS_SHOW ? 'Ẩn' : 'Hiện'} bình luận thành công`
            );
          } else {
            notify.error(
              `${comment.status === COMMENT_STATUS_SHOW ? 'Ẩn' : 'Hiện'} bình luận thất bại`
            );
          }
        },
        onError: (error) => {
          logger.error('[CHANGE_COMMENT_STATUS_ERROR]', error);
          notify.error(
            `${comment.status === COMMENT_STATUS_SHOW ? 'Ẩn' : 'Hiện'} bình luận thất bại`
          );
        }
      }
    );
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

    handleFetchNextPage();
  }, [
    comment.id,
    commentList,
    hasMore,
    isActiveParent,
    isFetchingMore,
    handleFetchNextPage,
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
              'ring-sporty-blue ring-2 transition-all duration-200 ease-linear':
                isScrollTarget
            }
          )}
        >
          <AvatarField
            src={renderImageUrl(authorInfo.avatarPath)}
            previewClassName='rounded-full'
            size={AVATAR_SIZE_COMMENT}
            alt={getLastWord(authorInfo.fullName)}
            className='mr-4'
          />

          <div className='flex-1'>
            <CommentHeader
              comment={comment}
              level={level}
              canPin={canPin}
              onPin={onPin}
            />

            <CommentContent
              isBlurWholeContent={isBlurWholeContent}
              renderContent={renderContent}
            />

            <CommentAction
              comment={comment}
              isLiked={isLiked}
              isDisliked={isDisliked}
              isAuthor={isAuthor}
              isVisible={isVisible}
              canVote={canVote}
              canCreate={canCreate}
              canUpdate={canUpdate}
              canDelete={canDelete}
              canChangeStatus={canChangeStatus}
              canViewHiddenContent={canViewHiddenContent}
              changeStatusCommentLoading={changeStatusCommentLoading}
              onVote={handleVote}
              onReply={handleReplyComment}
              onEdit={handleEditComment}
              onChangeStatus={handleChangeCommentStatus}
              onViewContent={handleViewContent}
              onDelete={onDelete}
            />

            <CommentReplyForm
              comment={comment}
              rootId={rootId}
              replyingComment={replyingComment}
              editingComment={editingComment}
              onSubmitted={handleReplySubmit}
              onCancel={handleCancelReply}
            />

            <CommentReplyList
              comment={comment}
              commentList={commentList}
              level={level}
              rootId={rootId}
              isActiveParent={isActiveParent}
              commentCount={commentCount}
              totalChildren={totalChildren}
              isOpen={isOpen}
              loading={loading}
              hasMore={hasMore}
              isFetchingMore={isFetchingMore}
              renderChildren={renderChildren}
              onFetchNextPage={handleFetchNextPage}
              onViewReplies={handleViewReplies}
              onHideReplies={handleHideReplies}
            />
          </div>
        </div>
      </div>
    </Element>
  );
}

CommentItem.Skeleton = CommentItemSkeleton;
