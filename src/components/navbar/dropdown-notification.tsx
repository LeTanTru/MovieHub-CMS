'use client';

import {
  apiConfig,
  NOTIFICATION_PAGE_SIZE,
  objectNames,
  queryKeys
} from '@/constants';
import { useDisclosure, useClickOutside, useInfiniteListBase } from '@/hooks';
import { NotificationResType, NotificationSearchType } from '@/types';
import { AnimatePresence, m } from 'framer-motion';
import { Bell, CheckCheck, Trash } from 'lucide-react';
import Link from 'next/link';
import { route } from '@/routes';
import {
  useCountUnreadNotificationQuery,
  useDeleteAllNotificationMutation,
  useReadAllNotificationMutation
} from '@/queries';
import { CircleLoading } from '@/components/loading';
import { Button } from '@/components/form';
import { ConfirmModal } from '@/components/modal';
import { invalidateQueries, notify } from '@/utils';
import { logger } from '@/logger';
import NotificationList from './notification-list';

export default function DropdownNotification() {
  const {
    opened: openedDropdown,
    toggle: toggleDropDown,
    close: closeDropDown
  } = useDisclosure();

  const dropdownRef = useClickOutside<HTMLDivElement>(() => closeDropDown());

  const { data: totalUnreadData } = useCountUnreadNotificationQuery();

  const {
    mutateAsync: readAllNotifyMutate,
    isPending: readAllNotificationLoading
  } = useReadAllNotificationMutation();

  const {
    mutateAsync: deleteAllNotifyMutate,
    isPending: deleteAllNotificationLoading
  } = useDeleteAllNotificationMutation();

  const totalUnread = totalUnreadData?.totalUnread || 0;

  const {
    data: notifications,
    loading,
    handlers,
    totalElements
  } = useInfiniteListBase<NotificationResType, NotificationSearchType>({
    apiConfig: apiConfig.notification,
    options: {
      objectName: objectNames.NOTIFICATION,
      queryKey: queryKeys.NOTIFICATION,
      pageSize: NOTIFICATION_PAGE_SIZE,
      enabled: openedDropdown
    }
  });

  const canReadAll = handlers.hasPermission({
    requiredPermissions: [apiConfig.notification.updateRead.permissionCode]
  });

  const canDelete = handlers.hasPermission({
    requiredPermissions: [apiConfig.notification.delete.permissionCode]
  });

  const handleDelete = (id: string) => {
    handlers.handleDeleteClick(id);
  };

  const handleReadAll = async () => {
    await readAllNotifyMutate(undefined, {
      onSuccess: () => {
        invalidateQueries([
          queryKeys.UNREAD_NOTIFICATION_COUNT,
          queryKeys.NOTIFICATION_INFINITE
        ]);
      },
      onError: (error) => {
        logger.error('[READ_ALL_NOTIFICATION_ERROR]', error);
        notify.error('Đọc tất cả thông báo thất bại');
      }
    });
  };

  const handleDeleteAll = async () => {
    await deleteAllNotifyMutate(undefined, {
      onSuccess: () => {
        invalidateQueries([
          queryKeys.UNREAD_NOTIFICATION_COUNT,
          queryKeys.NOTIFICATION_INFINITE
        ]);
      },
      onError: (error) => {
        logger.error('[DELETE_ALL_NOTIFICATION_ERROR]', error);
        notify.error('Xóa tất cả thông báo thất bại');
      }
    });
  };

  if (
    !handlers.hasPermission({
      requiredPermissions: [apiConfig.notification.getList.permissionCode]
    })
  )
    return null;

  return (
    <div ref={dropdownRef} className='relative z-1 flex items-center gap-4'>
      <div
        onClick={toggleDropDown}
        className='flex cursor-pointer items-center gap-2'
      >
        <div className='relative transition-all duration-200 ease-linear hover:opacity-60'>
          <Bell className='size-7' />
          <div className='absolute -top-1 right-0 flex size-4 items-center justify-center rounded-full bg-rose-500 px-2 text-[10px] font-medium text-white select-none'>
            {totalUnread > 9 ? '9+' : totalUnread}
          </div>
        </div>
      </div>
      <AnimatePresence initial={false}>
        {openedDropdown && (
          <m.div
            initial={{ scale: 0.8, opacity: 0, transformOrigin: '91% -5%' }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.1, ease: 'linear' }}
            className='absolute top-full -right-8.5 mt-4 w-150 rounded bg-white shadow-[0px_0px_10px_8px] shadow-gray-200'
          >
            <div className='z-2 before:absolute before:-top-4 before:left-0 before:h-4 before:w-full before:bg-transparent'></div>
            <div className='absolute -top-2 right-10 border-r-8 border-b-8 border-l-8 border-r-transparent border-b-white border-l-transparent'></div>
            <div className='flex items-center justify-between border-b border-gray-200 px-2 py-1'>
              <h3 className='font-medium'>Thông báo</h3>
              {notifications.length > 0 && !loading && (
                <div className='flex items-center gap-4'>
                  {canReadAll && (
                    <Button
                      type='button'
                      variant='ghost'
                      onClick={handleReadAll}
                      disabled={
                        readAllNotificationLoading || Number(totalUnread) === 0
                      }
                      className='hover:text-main-color flex h-fit cursor-pointer items-center gap-1 p-0! transition-all duration-200 ease-linear hover:bg-transparent disabled:cursor-not-allowed disabled:opacity-50'
                    >
                      {readAllNotificationLoading ? (
                        <CircleLoading className='stroke-main-color size-4' />
                      ) : (
                        <CheckCheck className='size-4' />
                      )}
                      Đọc tất cả
                    </Button>
                  )}
                  {canDelete && (
                    <ConfirmModal
                      message='Bạn có chắc chắn muốn xóa tất cả không báo không?'
                      onConfirm={handleDeleteAll}
                      trigger={
                        <Button
                          type='button'
                          variant='ghost'
                          disabled={
                            deleteAllNotificationLoading || totalElements === 0
                          }
                          className='flex h-fit cursor-pointer items-center gap-1 p-0! transition-all duration-200 ease-linear hover:bg-transparent hover:text-rose-500 disabled:cursor-not-allowed disabled:opacity-50'
                        >
                          {deleteAllNotificationLoading ? (
                            <CircleLoading className='stroke-main-color size-4' />
                          ) : (
                            <Trash className='size-4' />
                          )}
                          Xóa tất cả
                        </Button>
                      }
                    />
                  )}
                </div>
              )}
            </div>
            <NotificationList
              notifications={notifications}
              canDelete={canDelete}
              handleDelete={handleDelete}
              loading={loading}
              onClickItem={closeDropDown}
            />
            {notifications.length > 0 && (
              <div className='border-t border-t-gray-200 p-2 text-center'>
                <Link
                  className='hover:text-main-color inline-block transition-colors duration-200 ease-linear'
                  href={route.notification.getList.path}
                >
                  Xem tất cả
                </Link>
              </div>
            )}
          </m.div>
        )}
      </AnimatePresence>
    </div>
  );
}
