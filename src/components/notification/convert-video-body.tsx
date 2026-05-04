import { ImageField } from '@/components/form';
import { VIDEO_LIBRARY_STATE_COMPLETE } from '@/constants';
import { route } from '@/routes';
import { useVideoLibraryStore } from '@/store';
import { ConvertVideoNotificationType, NotificationResType } from '@/types';
import { convertUTCToLocal, parseJSON, renderImageUrl, timeAgo } from '@/utils';
import Link from 'next/link';
import { FaExclamationTriangle } from 'react-icons/fa';
import { FaCircleCheck } from 'react-icons/fa6';
import { useMemo } from 'react';

export default function ConvertVideoBody({
  notification
}: {
  notification: NotificationResType;
}) {
  const body = useMemo(
    () => parseJSON<ConvertVideoNotificationType>(notification.body),
    [notification.body]
  );
  const setTargetVideoId = useVideoLibraryStore((s) => s.setTargetVideoId);

  const handleClick = () => {
    setTargetVideoId(body?.id || null);
  };

  return (
    <Link
      onClick={handleClick}
      className='flex flex-1 items-center justify-between gap-2'
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
          {body?.state === VIDEO_LIBRARY_STATE_COMPLETE ? (
            <FaCircleCheck className='size-4.5 text-emerald-500' />
          ) : (
            <FaExclamationTriangle className='size-4.5 text-rose-500' />
          )}
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
