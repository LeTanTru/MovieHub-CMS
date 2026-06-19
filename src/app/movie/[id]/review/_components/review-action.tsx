import { Button, ToolTip } from '@/components/form';
import { ConfirmModal } from '@/components/modal';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { REVIEW_STATUS_SHOW } from '@/constants';
import type { ReviewResType } from '@/types';
import { Edit, Ellipsis, Eye, EyeClosed } from 'lucide-react';
import {
  AiOutlineDelete,
  AiOutlineEye,
  AiOutlineEyeInvisible
} from 'react-icons/ai';
import { FaArrowAltCircleDown, FaArrowAltCircleUp } from 'react-icons/fa';

type ReviewActionProps = {
  review: ReviewResType;
  isVisible: boolean;
  canDelete: boolean;
  canChangeStatus: boolean;
  canUpdateToxicSpans: boolean;
  canViewHiddenContent: boolean;
  changeReviewStatusLoading: boolean;
  onChangeStatus: (id: string, status: number) => void;
  onViewContent: () => void;
  onDelete: () => void;
  onToxicSpansClick: () => void;
};

export function ReviewAction({
  review,
  isVisible,
  canDelete,
  canChangeStatus,
  canUpdateToxicSpans,
  canViewHiddenContent,
  changeReviewStatusLoading,
  onChangeStatus,
  onViewContent,
  onDelete,
  onToxicSpansClick
}: ReviewActionProps) {
  return (
    <div className='mt-4 flex items-center gap-x-8 text-sm text-gray-500'>
      <div className='flex items-center gap-x-6'>
        <div className='flex items-center gap-x-2'>
          <ToolTip title='Thích'>
            <Button
              variant='ghost'
              className='size-5! p-0! text-gray-400 hover:text-gray-400'
            >
              <FaArrowAltCircleUp className='size-5' />
            </Button>
          </ToolTip>
          {review.totalLike}
        </div>

        <div className='flex items-center gap-x-2'>
          <ToolTip title='Không thích'>
            <Button
              variant='ghost'
              className='size-5! p-0! text-gray-400 hover:text-gray-400'
            >
              <FaArrowAltCircleDown className='size-5' />
            </Button>
          </ToolTip>
          {review.totalDislike}
        </div>
      </div>
      {(canViewHiddenContent ||
        canChangeStatus ||
        canDelete ||
        canUpdateToxicSpans) && (
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
            className='min-w-56'
            align='start'
          >
            <DropdownMenuGroup>
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
                    className='h-fit w-full justify-start p-2! transition-all duration-200 ease-linear [&_svg]:size-5!'
                    variant='ghost'
                    onClick={() => onChangeStatus(review.id, review.status)}
                    loading={changeReviewStatusLoading}
                  >
                    {review.status === REVIEW_STATUS_SHOW ? (
                      <>
                        <AiOutlineEyeInvisible />
                        Ẩn đánh giá
                      </>
                    ) : (
                      <>
                        <AiOutlineEye />
                        Hiện đánh giá
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
                    className='h-fit w-full justify-start p-2! transition-all duration-200 ease-linear [&_svg]:size-5!'
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
                <DropdownMenuItem className='cursor-pointer p-0! transition-all duration-200 ease-linear'>
                  <ConfirmModal
                    message='Bạn có chắc chắn muốn xóa đánh giá này không ?'
                    onConfirm={onDelete}
                    trigger={
                      <Button className='text-destructive hover:text-destructive/50 h-fit w-full justify-start border-none bg-transparent p-2! shadow-none hover:bg-transparent'>
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
