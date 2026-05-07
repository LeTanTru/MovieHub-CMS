'use client';

import { Button } from '@/components/form';
import { ListPageWrapper, PageWrapper } from '@/components/layout';
import { List } from '@/components/list';
import { CircleLoading, DotLoading } from '@/components/loading';
import { ConfirmModal } from '@/components/modal';
import { NoData } from '@/components/no-data';
import { NotificationItem } from '@/components/notification';
import {
  apiConfig,
  NOTIFICATION_PAGE_SIZE,
  objectNames,
  queryKeys
} from '@/constants';
import { useInfiniteListBase } from '@/hooks';
import { cn } from '@/lib';
import { logger } from '@/logger';
import {
  useCountUnreadNotificationQuery,
  useDeleteAllNotificationMutation,
  useReadAllNotificationMutation,
  useUpdateReadNotificationMutation
} from '@/queries';
import { NotificationResType, NotificationSearchType } from '@/types';
import { invalidateQueries, notify } from '@/utils';
import { CheckCheck, Trash } from 'lucide-react';

export default function NotificationList() {
  const {
    data: notificationList,
    loading,
    handlers,
    isFetchingMore,
    hasMore,
    totalLeft,
    totalElements
  } = useInfiniteListBase<NotificationResType, NotificationSearchType>({
    apiConfig: apiConfig.notification,
    options: {
      objectName: objectNames.NOTIFICATION,
      queryKey: queryKeys.NOTIFICATION,
      pageSize: NOTIFICATION_PAGE_SIZE
    }
  });

  const { data: totalUnreadData } = useCountUnreadNotificationQuery();

  const totalUnread = totalUnreadData?.totalUnread || 0;

  const { mutateAsync: updateReadMutate } = useUpdateReadNotificationMutation();

  const {
    mutateAsync: readAllNotificationMutate,
    isPending: readAllNotificationLoading
  } = useReadAllNotificationMutation();

  const {
    mutateAsync: deleteAllNotificationMutate,
    isPending: deleteAllNotificationLoading
  } = useDeleteAllNotificationMutation();

  const handleUpdateRead = async (notification: NotificationResType) => {
    if (notification.isRead) return;
    await updateReadMutate(
      { ids: [notification.id] },
      {
        onSuccess: () => {
          invalidateQueries([
            queryKeys.UNREAD_NOTIFICATION_COUNT,
            queryKeys.NOTIFICATION_INFINITE
          ]);
        }
      }
    );
  };

  const canReadAll = handlers.hasPermission({
    requiredPermissions: [apiConfig.notification.updateRead.permissionCode]
  });

  const canDelete = handlers.hasPermission({
    requiredPermissions: [apiConfig.notification.delete.permissionCode]
  });

  const handleDelete = (id: string) => {
    handlers.handleDeleteClick(id);
  };

  const handleFetchMore = () => {
    handlers.loadMore();
  };

  const handleReadAll = async () => {
    await readAllNotificationMutate(undefined, {
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
    await deleteAllNotificationMutate(undefined, {
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

  const ButtonReadAll = () => {
    if (!canReadAll) return null;

    return (
      <Button
        type='button'
        variant='primary'
        onClick={handleReadAll}
        disabled={readAllNotificationLoading || Number(totalUnread) === 0}
      >
        {readAllNotificationLoading ? (
          <CircleLoading className='size-4' />
        ) : (
          <CheckCheck className='size-4' />
        )}
        Đọc tất cả
      </Button>
    );
  };

  const ButtonDeleteAll = () => {
    if (!canDelete) return null;

    return (
      <ConfirmModal
        message='Bạn có chắc chắn muốn xóa tất cả không báo không?'
        onConfirm={handleDeleteAll}
        trigger={
          <Button
            type='button'
            variant='destructive'
            disabled={deleteAllNotificationLoading || totalElements === 0}
          >
            {deleteAllNotificationLoading ? (
              <CircleLoading className='size-4' />
            ) : (
              <Trash className='size-4' />
            )}
            Xóa tất cả
          </Button>
        }
      />
    );
  };

  return (
    <PageWrapper breadcrumbs={[{ label: 'Thông báo' }]}>
      <ListPageWrapper
        reloadButton={handlers.renderReloadButton()}
        additionButtons={[
          <ButtonReadAll key='read-all' />,
          <ButtonDeleteAll key='delete-all' />
        ]}
      >
        {notificationList.length ? (
          <List className='scrollbar-none flex flex-col overflow-y-auto rounded bg-white'>
            {notificationList.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                canDelete={handlers.hasPermission({
                  requiredPermissions: [
                    apiConfig.notification.delete.permissionCode
                  ]
                })}
                onDelete={handleDelete}
                onItemClick={handleUpdateRead}
              />
            ))}
          </List>
        ) : (
          <NoData width={150} content='Không có thông báo nào' />
        )}
        {(loading || isFetchingMore) && (
          <DotLoading className='mx-auto mt-4 justify-center bg-transparent' />
        )}
        <div
          className={cn('flex justify-center', {
            'pb-4': hasMore && !loading && !isFetchingMore
          })}
        >
          {hasMore && !loading && !isFetchingMore && (
            <Button
              variant='ghost'
              className='hover:text-main-color mx-auto mt-2 h-5! p-0! font-medium hover:bg-transparent'
              onClick={handleFetchMore}
            >
              Xem thêm ({totalLeft}) thông báo
            </Button>
          )}
        </div>
      </ListPageWrapper>
    </PageWrapper>
  );
}
