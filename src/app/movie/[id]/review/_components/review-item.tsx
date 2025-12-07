'use client';

import { AvatarField, Button, ToolTip } from '@/components/form';
import { StarRating } from '@/components/star-rating';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
  apiConfig,
  GENDER_FEMALE,
  GENDER_MALE,
  queryKeys,
  REVIEW_STATUS_HIDE,
  REVIEW_STATUS_SHOW
} from '@/constants';
import { useValidatePermission } from '@/hooks';
import { cn } from '@/lib';
import { useChangeReviewStatusMutation } from '@/queries';
import { ReviewResType } from '@/types';
import { convertUTCToLocal, renderImageUrl, timeAgo } from '@/utils';
import { useQueryClient } from '@tanstack/react-query';
import { Ellipsis, Info, Mars, Venus } from 'lucide-react';
import {
  AiOutlineDelete,
  AiOutlineEye,
  AiOutlineEyeInvisible
} from 'react-icons/ai';
import { FaArrowAltCircleDown, FaArrowAltCircleUp } from 'react-icons/fa';

export default function ReviewItem({
  review,
  onDelete
}: {
  review: ReviewResType;
  onDelete: () => void;
}) {
  const { hasPermission } = useValidatePermission();
  const queryClient = useQueryClient();
  const changeReviewStatusMutation = useChangeReviewStatusMutation();

  const canDelete = hasPermission({
    requiredPermissions: [apiConfig.review.delete.permissionCode]
  });

  const canChangeStatus = hasPermission({
    requiredPermissions: [apiConfig.review.changeStatus.permissionCode]
  });

  const handleChangeCommentStatus = async (id: string, status: number) => {
    await changeReviewStatusMutation.mutateAsync({
      id,
      status:
        status === REVIEW_STATUS_SHOW ? REVIEW_STATUS_HIDE : REVIEW_STATUS_SHOW
    });
    queryClient.invalidateQueries({
      queryKey: [`${queryKeys.REVIEW}-infinite`]
    });
  };

  return (
    <div className='pt-4'>
      <div className='flex items-start space-x-3 rounded-md border p-3 transition hover:bg-gray-50'>
        <AvatarField
          src={renderImageUrl(review.author.avatarPath)}
          previewClassName='rounded-full'
          size={40}
          alt={review.author.fullName}
        />
        <div className='flex-1'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-x-2'>
              <h4 className='flex items-center gap-x-2 font-medium text-gray-800'>
                <span className='font-semibold'>{review.author.fullName}</span>
                <span>
                  {review.author.gender === GENDER_MALE ? (
                    <Mars className='size-4 text-blue-500' />
                  ) : review.author.gender === GENDER_FEMALE ? (
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
                title={convertUTCToLocal(review.createdDate)}
              >
                {timeAgo(review.createdDate)}
              </span>

              {review.status === REVIEW_STATUS_HIDE && (
                <span title='Đánh giá đã bị ẩn' className='text-gray-500'>
                  <AiOutlineEyeInvisible className='size-4' />
                </span>
              )}
              {review.status === REVIEW_STATUS_SHOW && (
                <span title='Đánh giá đang hiển thị' className='text-green-500'>
                  <AiOutlineEye className='size-4' />
                </span>
              )}
            </div>
          </div>

          <div className='mt-2 flex flex-col gap-2'>
            <p className='text-gray-700'>{review.content}</p>
            <StarRating value={review.rate} showValue={false} />
          </div>

          <div className='mt-4 flex items-center gap-x-8 text-sm text-gray-500'>
            <div className='flex items-center gap-x-6'>
              <div className='flex items-center gap-x-2'>
                <ToolTip title='Thích'>
                  <Button variant='ghost' className={cn('size-5! p-0!')}>
                    <FaArrowAltCircleUp className='size-5' />
                  </Button>
                </ToolTip>
                {review.totalLike}
              </div>

              <div className='flex items-center gap-x-2'>
                <ToolTip title='Không thích'>
                  <Button variant='ghost' className={cn('size-5! p-0!')}>
                    <FaArrowAltCircleDown className='size-5' />
                  </Button>
                </ToolTip>
                {review.totalDislike}
              </div>
            </div>
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
                            handleChangeCommentStatus(review.id, review.status)
                          }
                          loading={changeReviewStatusMutation.isPending}
                        >
                          {review.status === REVIEW_STATUS_SHOW ? (
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
        </div>
      </div>
    </div>
  );
}
