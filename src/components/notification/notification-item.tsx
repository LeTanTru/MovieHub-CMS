'use client';

import { Button } from '@/components/form';
import { ConfirmModal } from '@/components/modal';
import NotificationBody from './notification-body';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib';
import { NotificationResType } from '@/types';
import { EllipsisVertical } from 'lucide-react';
import { AiOutlineDelete } from 'react-icons/ai';

type NotificationItemProps = {
  notification: NotificationResType;
  canDelete?: boolean;
  onDelete: (id: string) => void;
  onClickItem: (notification: NotificationResType) => void;
};

export default function NotificationItem({
  notification,
  canDelete = false,
  onDelete,
  onClickItem
}: NotificationItemProps) {
  return (
    <div
      onClick={onClickItem && (() => onClickItem(notification))}
      className={cn(
        'flex cursor-pointer items-center justify-between rounded p-2 transition-colors duration-200 ease-linear hover:bg-gray-200',
        {
          'bg-gray-100': !notification.isRead
        }
      )}
    >
      <NotificationBody notification={notification} />
      {canDelete && (
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger
            className='border-none bg-transparent shadow-none'
            asChild
          >
            <Button variant='outline'>
              <EllipsisVertical />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent sideOffset={0} className='w-40' align='center'>
            <DropdownMenuGroup>
              <DropdownMenuItem className='cursor-pointer p-0! transition-all duration-200 ease-linear'>
                {canDelete && (
                  <ConfirmModal
                    message='Bạn có chắc chắn muốn xóa thông báo này không ?'
                    onConfirm={() => onDelete(notification.id)}
                    trigger={
                      <Button
                        variant='ghost'
                        className='h-fit w-full justify-start border-none bg-transparent p-2! text-rose-500 shadow-none hover:bg-transparent hover:text-rose-500/50'
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
  );
}
