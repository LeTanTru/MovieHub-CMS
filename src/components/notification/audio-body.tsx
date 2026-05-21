import { ImageField } from '@/components/form';
import { route } from '@/routes';
import { useVideoLibraryStore } from '@/store';
import { AudioNotificationType, NotificationResType } from '@/types';
import { convertUTCToLocal, parseJSON, renderImageUrl, timeAgo } from '@/utils';
import Link from 'next/link';
import { useMemo } from 'react';

export default function AudioBody({
  notification
}: {
  notification: NotificationResType;
}) {
  const body = useMemo(
    () => parseJSON<AudioNotificationType>(notification.body),
    [notification.body]
  );
  const setTargetVideoId = useVideoLibraryStore((s) => s.setTargetVideoId);

  const handleClick = () => {
    setTargetVideoId(body?.id || null);
  };

  return (
    <Link
      onClick={handleClick}
      className='flex flex-1 items-center justify-between gap-2 pl-1'
      href={route.videoLibrary.getList.path}
    >
      <div className='relative w-20 shrink-0'>
        <ImageField
          src={renderImageUrl(body?.thumbnailUrl)}
          alt={body?.name}
          aspect={16 / 9}
          disablePreview
        />
      </div>
      <div className='flex flex-1 flex-col justify-between'>
        <div className='flex items-start gap-2'>
          <h3 className='font-medium' title={notification.title}>
            {notification.title}
          </h3>
        </div>
        <div
          className='text-muted-foreground shrink-0 text-xs'
          title={convertUTCToLocal(notification.createdDate)}
        >
          {timeAgo(notification.createdDate)}
        </div>
      </div>
    </Link>
  );
}
