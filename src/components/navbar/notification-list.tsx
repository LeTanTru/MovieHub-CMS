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
  notifications: NotificationResType[];
  canDelete: boolean;
  loading?: boolean;
  handleDelete: (id: string) => void;
};

export default function NotificationList({
  notifications,
  canDelete,
  loading,
  handleDelete
}: Props) {
  const { mutateAsync: updateReadMutate } = useUpdateReadNotificationMutation();

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

  if (loading) {
    return (
      <div className='flex min-h-[50vh] items-center justify-center'>
        <CircleLoading className='stroke-main-color' />
      </div>
    );
  }

  if (!notifications.length) {
    return <NoData width={150} content='Không có thông báo nào' />;
  }

  return (
    <List className='scrollbar-none flex max-h-[80vh] min-h-[50vh] flex-col overflow-y-auto rounded bg-white p-1'>
      {notifications.map((notification) => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          onUpdateRead={handleUpdateRead}
          canDelete={canDelete}
          onDelete={handleDelete}
        />
      ))}
    </List>
  );
}
