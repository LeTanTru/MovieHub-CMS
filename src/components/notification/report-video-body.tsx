import { AvatarField, ImageField } from '@/components/form';
import { useQueryParams } from '@/hooks';
import { route } from '@/routes';
import { NotificationResType, ReportVideoNotificationType } from '@/types';
import {
  convertUTCToLocal,
  parseJSON,
  renderImageUrl,
  renderListPageUrl,
  timeAgo
} from '@/utils';
import Link from 'next/link';
import { useMemo } from 'react';

export function ReportVideoBody({
  notification
}: {
  notification: NotificationResType;
}) {
  const { serializeParams } = useQueryParams();

  const body = useMemo(
    () => parseJSON<ReportVideoNotificationType>(notification.body),
    [notification.body]
  );

  return (
    <Link
      className='flex flex-1 items-center justify-between gap-2 pl-1'
      href={renderListPageUrl(
        route.videoLibrary.getList.path,
        serializeParams({
          sourceType: body?.videoSourceType,
          id: body?.videoId ?? ''
        })
      )}
    >
      <div className='flex shrink-0 justify-center'>
        <AvatarField
          size={40}
          src={renderImageUrl(body?.user?.avatarPath)}
          alt={body?.user?.fullName || body?.user?.username}
          disablePreview
        />
      </div>
      <div className='flex flex-1 flex-col justify-between'>
        <h3 className='line-clamp-2 font-medium' title={notification.title}>
          {notification.title}:&nbsp;&quot;
          <span className='font-normal'>{body?.content}</span>&quot;
        </h3>
        <div
          className='text-muted-foreground mt-2 shrink-0 text-xs'
          title={convertUTCToLocal(notification.createdDate)}
        >
          {timeAgo(notification.createdDate)}
        </div>
      </div>
      <div className='relative aspect-video w-20 shrink-0'>
        <ImageField
          src={renderImageUrl(body?.videoThumbnailUrl)}
          alt={body?.videoName}
          aspect={16 / 9}
          disablePreview
          className='h-full'
        />
      </div>
    </Link>
  );
}
