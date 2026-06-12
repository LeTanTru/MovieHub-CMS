'use client';

import {
  DEFAULT_TABLE_PAGE_START,
  NOTIFICATION_PAGE_SIZE,
  NOTIFICATION_TYPE_SYSTEM,
  apiConfig,
  notificationTabs,
  objectNames,
  queryKeys
} from '@/constants';
import {
  useDisclosure,
  useClickOutside,
  useInfiniteListBase,
  useQueryParams
} from '@/hooks';
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
import { invalidateQueries, notify, renderListPageUrl } from '@/utils';
import { logger } from '@/logger';
import { NotificationList } from './notification-list';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useState } from 'react';

const NOTIFICATION_BADGE_MAX_DISPLAY = 9;

export function DropdownNotification() {
  const { serializeParams } = useQueryParams();

  const [params, setParams] = useState<NotificationSearchType>({
    type: String(NOTIFICATION_TYPE_SYSTEM),
    page: DEFAULT_TABLE_PAGE_START,
    size: NOTIFICATION_PAGE_SIZE
  });

  const {
    opened: openedDropdown,
    toggle: toggleDropDown,
    close: closeDropDown
  } = useDisclosure();

  const dropdownRef = useClickOutside<HTMLDivElement>(() => closeDropDown());

  const { data: totalUnreadData } = useCountUnreadNotificationQuery();

  const {
    mutateAsync: readAllNotificationMutate,
    isPending: readAllNotificationLoading
  } = useReadAllNotificationMutation();

  const {
    mutateAsync: deleteAllNotificationMutate,
    isPending: deleteAllNotificationLoading
  } = useDeleteAllNotificationMutation();

  const totalUnread = totalUnreadData?.totalUnread
    ? Number(totalUnreadData.totalUnread)
    : 0;

  const {
    data: notificationList,
    loading,
    handlers,
    totalElements
  } = useInfiniteListBase<NotificationResType, NotificationSearchType>({
    apiConfig: apiConfig.notification,
    options: {
      objectName: objectNames.NOTIFICATION,
      queryKey: queryKeys.NOTIFICATION,
      pageSize: NOTIFICATION_PAGE_SIZE,
      enabled: openedDropdown,
      defaultFilters: { ...params },
      notShowFromSearchParams: ['type', 'page', 'size']
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
    await readAllNotificationMutate(undefined, {
      onSuccess: () => {
        invalidateQueries(
          [queryKeys.UNREAD_NOTIFICATION_COUNT],
          [queryKeys.NOTIFICATION_INFINITE]
        );
      },
      onError: (error) => {
        logger.error('[READ_ALL_NOTIFICATION_ERROR]', error);
        notify.error('Đọc tất cả thông báo thất bại');
      }
    });
  };

  const handleDeleteAll = async () => {
    await deleteAllNotificationMutate(undefined, {
      onSuccess: () => {
        invalidateQueries(
          [queryKeys.UNREAD_NOTIFICATION_COUNT],
          [queryKeys.NOTIFICATION_INFINITE]
        );
      },
      onError: (error) => {
        logger.error('[DELETE_ALL_NOTIFICATION_ERROR]', error);
        notify.error('Xóa tất cả thông báo thất bại');
      }
    });
  };

  const handleItemClick = () => {
    closeDropDown();
  };

  if (
    !handlers.hasPermission({
      requiredPermissions: [apiConfig.notification.getList.permissionCode]
    })
  )
    return null;

  const handleChangeTab = (type: string) => {
    setParams((prev) => ({ ...prev, type }));
  };

  return (
    <div ref={dropdownRef} className='relative z-1 flex items-center gap-4'>
      <div
        role='button'
        tabIndex={0}
        onClick={toggleDropDown}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            toggleDropDown();
          }
        }}
        className='flex cursor-pointer items-center gap-2'
      >
        <div className='relative transition-all duration-200 ease-linear hover:opacity-60'>
          <Bell className='size-7' />
          {!!totalUnread && (
            <div className='absolute -top-1 right-0 flex size-4 items-center justify-center rounded-full bg-rose-500 px-2 text-[10px] font-medium text-white select-none'>
              {totalUnread > NOTIFICATION_BADGE_MAX_DISPLAY
                ? `${NOTIFICATION_BADGE_MAX_DISPLAY}+`
                : totalUnread}
            </div>
          )}
        </div>
      </div>
      <AnimatePresence initial={false}>
        {openedDropdown && (
          <m.div
            initial={{ scale: 0.8, opacity: 0, transformOrigin: '91% -5%' }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.1, ease: 'linear' }}
            className='absolute top-full -right-8.5 z-50 mt-4 w-150 rounded bg-white shadow-[0px_0px_10px_8px] shadow-gray-200'
          >
            <div className='z-2 before:absolute before:-top-4 before:left-0 before:h-4 before:w-full before:bg-transparent'></div>
            <div className='absolute -top-2 right-10 border-r-8 border-b-8 border-l-8 border-r-transparent border-b-white border-l-transparent'></div>
            <Tabs
              defaultValue={String(NOTIFICATION_TYPE_SYSTEM)}
              className='flex-1 gap-0 rounded'
              onValueChange={handleChangeTab}
            >
              <div className='flex items-center justify-between border-b border-gray-200 px-2 py-1'>
                <div className='flex-1'>
                  <TabsList className='relative flex w-fit justify-start gap-0 rounded-none border-none bg-transparent p-0'>
                    {notificationTabs.map((notification) => {
                      return (
                        <div
                          key={notification.value}
                          className='relative flex h-full items-center'
                        >
                          <TabsTrigger
                            className='data-[state=active]:bg-accent cursor-pointer transition-all duration-200 ease-linear data-[state=active]:text-black data-[state=active]:shadow-none'
                            value={notification.value.toString()}
                          >
                            {notification.label}
                          </TabsTrigger>
                        </div>
                      );
                    })}
                  </TabsList>
                </div>
                {notificationList.length > 0 && !loading && (
                  <div className='flex items-center gap-4'>
                    {canReadAll && totalUnread > 0 && (
                      <Button
                        type='button'
                        variant='ghost'
                        onClick={handleReadAll}
                        disabled={readAllNotificationLoading}
                        className='hover:text-sporty-blue flex h-fit cursor-pointer items-center gap-1 p-0! transition-all duration-200 ease-linear hover:bg-transparent disabled:cursor-not-allowed disabled:opacity-50'
                      >
                        {readAllNotificationLoading ? (
                          <CircleLoading className='stroke-sporty-blue size-4' />
                        ) : (
                          <CheckCheck className='size-4' />
                        )}
                        Đọc tất cả
                      </Button>
                    )}
                    {canDelete && totalElements > 0 && (
                      <ConfirmModal
                        message='Bạn có chắc chắn muốn xóa tất cả không báo không?'
                        onConfirm={handleDeleteAll}
                        trigger={
                          <Button
                            type='button'
                            variant='ghost'
                            disabled={deleteAllNotificationLoading}
                            className='flex h-fit cursor-pointer items-center gap-1 p-0! transition-all duration-200 ease-linear hover:bg-transparent hover:text-rose-500 disabled:cursor-not-allowed disabled:opacity-50'
                          >
                            {deleteAllNotificationLoading ? (
                              <CircleLoading className='stroke-sporty-blue size-4' />
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
              {notificationTabs.map((tab) => (
                <TabsContent key={tab.value} value={tab.value.toString()}>
                  <NotificationList
                    notificationList={notificationList}
                    canDelete={canDelete}
                    onDelete={handleDelete}
                    loading={loading}
                    onItemClick={handleItemClick}
                  />
                </TabsContent>
              ))}
            </Tabs>
            {notificationList.length > 0 && (
              <div className='border-t border-t-gray-200 p-2 text-center'>
                <Link
                  className='hover:text-sporty-blue inline-block transition-colors duration-200 ease-linear'
                  href={renderListPageUrl(
                    route.notification.getList.path,
                    serializeParams({ type: NOTIFICATION_TYPE_SYSTEM })
                  )}
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
