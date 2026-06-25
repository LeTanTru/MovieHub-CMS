import { Button, ToolTip } from '@/components/form';
import { ConfirmModal } from '@/components/modal';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
  COMMENT_STATUS_SHOW,
  REACTION_TYPE_DISLIKE,
  REACTION_TYPE_LIKE
} from '@/constants';
import { cn } from '@/lib';
import type { CommentResType } from '@/types';
import { Edit, Ellipsis, Eye, EyeClosed, Flag, Reply } from 'lucide-react';
import {
  AiOutlineDelete,
  AiOutlineEdit,
  AiOutlineEye,
  AiOutlineEyeInvisible
} from 'react-icons/ai';
import { FaArrowAltCircleDown, FaArrowAltCircleUp } from 'react-icons/fa';

type CommentActionProps = {
  comment: CommentResType & {
    children?: CommentResType[];
  };
  isLiked: boolean;
  isDisliked: boolean;
  isAuthor: boolean;
  isVisible: boolean;
  canVote: boolean;
  canCreate: boolean;
  canUpdate: boolean;
  canDelete: boolean;
  canChangeStatus: boolean;
  canUpdateToxicSpans: boolean;
  canViewHiddenContent: boolean;
  changeStatusCommentLoading: boolean;
  onVote: (id: string, type: number) => void;
  onReply: () => void;
  onEdit: (comment: CommentResType) => void;
  onChangeStatus: (id: string, status: number) => void;
  onViewContent: () => void;
  onDelete: () => void;
  onToxicSpansClick: () => void;
  onReportClick: () => void;
};

export function CommentAction({
  comment,
  isLiked,
  isDisliked,
  isAuthor,
  isVisible,
  canVote,
  canCreate,
  canUpdate,
  canDelete,
  canChangeStatus,
  canUpdateToxicSpans,
  canViewHiddenContent,
  changeStatusCommentLoading,
  onVote,
  onReply,
  onEdit,
  onChangeStatus,
  onViewContent,
  onDelete,
  onToxicSpansClick,
  onReportClick
}: CommentActionProps) {
  return (
    <div className='mt-4 flex items-center gap-x-8 text-sm text-gray-500'>
      {canVote && (
        <div className='flex items-center gap-x-6'>
          <div className='flex items-center gap-x-2'>
            <ToolTip title='Thích'>
              <Button
                variant='ghost'
                className={cn('size-5! p-0! select-none hover:text-sky-500', {
                  '[&_svg]:fill-sky-500 [&_svg]:stroke-sky-500': isLiked
                })}
                onClick={() => onVote(comment.id, REACTION_TYPE_LIKE)}
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
                className={cn('size-5! p-0! select-none hover:text-rose-500', {
                  '[&_svg]:fill-rose-500 [&_svg]:stroke-rose-500': isDisliked
                })}
                onClick={() => onVote(comment.id, REACTION_TYPE_DISLIKE)}
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
          className='h-5! p-0! select-none hover:bg-transparent'
          onClick={onReply}
        >
          <Reply className='size-5' /> Trả lời
        </Button>
      )}

      {isAuthor && canUpdate && (
        <Button
          variant='ghost'
          className='text-sporty-blue hover:text-sporty-blue/50 h-5! p-0! select-none hover:bg-transparent'
          onClick={() => onEdit(comment)}
        >
          <AiOutlineEdit className='size-5' />
          Cập nhật
        </Button>
      )}

      {(canViewHiddenContent ||
        canChangeStatus ||
        canDelete ||
        canUpdateToxicSpans) && (
        <DropdownMenu modal={false}>
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
            className='min-w-56'
            align='start'
          >
            <DropdownMenuGroup>
              <DropdownMenuItem className='cursor-pointer' asChild>
                <Button
                  className='hover:bg-accent/80 h-fit w-full justify-start p-2! transition-all duration-200 ease-linear [&_svg]:size-5!'
                  variant='ghost'
                  onClick={onReportClick}
                >
                  <Flag className='size-5' />
                  Báo cáo vi phạm
                </Button>
              </DropdownMenuItem>
              {canUpdateToxicSpans && (
                <DropdownMenuItem className='cursor-pointer' asChild>
                  <Button
                    className='hover:bg-accent/80 h-fit w-full justify-start p-2! transition-all duration-200 ease-linear [&_svg]:size-5!'
                    variant='ghost'
                    onClick={onToxicSpansClick}
                  >
                    <Edit className='size-5' />
                    Cập nhật nội dung độc hại
                  </Button>
                </DropdownMenuItem>
              )}
              {canChangeStatus && (
                <DropdownMenuItem className='cursor-pointer' asChild>
                  <Button
                    className='hover:bg-accent/80 h-fit w-full justify-start p-2! transition-all duration-200 ease-linear [&_svg]:size-5!'
                    variant='ghost'
                    onClick={() => onChangeStatus(comment.id, comment.status)}
                    loading={changeStatusCommentLoading}
                  >
                    {comment.status === COMMENT_STATUS_SHOW ? (
                      <>
                        <AiOutlineEyeInvisible />
                        Ẩn bình luận
                      </>
                    ) : (
                      <>
                        <AiOutlineEye />
                        Hiện bình luận
                      </>
                    )}
                  </Button>
                </DropdownMenuItem>
              )}
              {canViewHiddenContent && (
                <DropdownMenuItem
                  className='cursor-pointer p-0! transition-all duration-200 ease-linear'
                  asChild
                >
                  <Button
                    className='hover:bg-accent/80 h-fit w-full justify-start p-2! transition-all duration-200 ease-linear [&_svg]:size-5!'
                    variant='ghost'
                    onClick={onViewContent}
                  >
                    {isVisible ? (
                      <>
                        <EyeClosed />
                        Ẩn nội dung
                      </>
                    ) : (
                      <>
                        <Eye />
                        Xem nội dung
                      </>
                    )}
                  </Button>
                </DropdownMenuItem>
              )}
              {canDelete && (
                <DropdownMenuItem
                  className='cursor-pointer p-0! transition-all duration-200 ease-linear'
                  onSelect={(e) => e.preventDefault()}
                >
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
                </DropdownMenuItem>
              )}
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
}
