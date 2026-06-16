import { Button } from '@/components/form';
import { DotLoading } from '@/components/loading';
import type { CommentResType } from '@/types';
import type { ReactNode } from 'react';

type CommentReplyListProps = {
  comment: CommentResType & {
    children?: CommentResType[];
  };
  commentList: CommentResType[];
  level: number;
  rootId: string;
  isActiveParent: boolean;
  commentCount: number;
  totalChildren: number;
  isOpen: boolean;
  loading: boolean;
  hasMore: boolean;
  isFetchingMore: boolean;
  renderChildren: (
    list: CommentResType[],
    level: number,
    rootId?: string
  ) => ReactNode;
  onFetchNextPage: () => void;
  onViewReplies: (parentId: string) => void;
  onHideReplies: (parentId: string) => void;
};

export function CommentReplyList({
  comment,
  commentList,
  level,
  rootId,
  isActiveParent,
  commentCount,
  totalChildren,
  isOpen,
  loading,
  hasMore,
  isFetchingMore,
  renderChildren,
  onFetchNextPage,
  onViewReplies,
  onHideReplies
}: CommentReplyListProps) {
  return (
    <>
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
              onClick={() => onViewReplies(comment.id)}
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
                  onClick={onFetchNextPage}
                >
                  Xem thêm ({totalChildren - commentCount})
                </Button>
              )}

              <Button
                variant='ghost'
                className='h-5! p-0! font-medium text-rose-500 hover:bg-transparent hover:opacity-70'
                onClick={() => onHideReplies(comment.id)}
              >
                Ẩn trả lời
              </Button>
            </div>
          )}
        </>
      )}
    </>
  );
}
