'use client';

import { List } from '@/components/list';
import { NotificationResType } from '@/types';
import { useUpdateReadNotificationMutation } from '@/queries';
import { NoData } from '@/components/no-data';
import { invalidateQueries } from '@/utils';
import { queryKeys } from '@/constants';
import { NotificationItem } from '@/components/notification';
import { CircleLoading } from '@/components/loading';

type Props = {
  notificationList: NotificationResType[];
  canDelete: boolean;
  loading?: boolean;
  onDelete: (id: string) => void;
  onItemClick?: () => void;
};

export function NotificationList({
  notificationList,
  canDelete,
  loading,
  onDelete,
  onItemClick
}: Props) {
  const { mutate: updateReadNotificationMutate } =
    useUpdateReadNotificationMutation();

  const handleItemClick = (notification: NotificationResType) => {
    onItemClick?.();

    if (notification.isRead) return;

    updateReadNotificationMutate(
      { ids: [notification.id] },
      {
        onSuccess: () => {
          invalidateQueries(
            [queryKeys.UNREAD_NOTIFICATION_COUNT],
            [queryKeys.NOTIFICATION_INFINITE]
          );
        }
      }
    );
  };

  if (loading) {
    return (
      <div className='flex min-h-[50vh] items-center justify-center'>
        <CircleLoading className='stroke-sporty-blue' />
      </div>
    );
  }

  if (!notificationList.length) {
    return <NoData width={150} content='Không có thông báo nào' />;
  }

  return (
    <List className='flex max-h-[80vh] min-h-[50vh] flex-col overflow-y-auto rounded bg-white'>
      {notificationList.map((notification) => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          canDelete={canDelete}
          onDelete={onDelete}
          onItemClick={handleItemClick}
        />
      ))}
    </List>
  );
}
