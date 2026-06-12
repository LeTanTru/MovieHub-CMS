import { ImageField } from '@/components/form';
import { useQueryParams } from '@/hooks';
import { route } from '@/routes';
import { NotificationResType, SubtitleNotificationType } from '@/types';
import {
  convertUTCToLocal,
  generatePath,
  parseJSON,
  renderImageUrl,
  renderListPageUrl,
  timeAgo
} from '@/utils';
import Link from 'next/link';
import { useMemo } from 'react';

export function SubtitleBody({
  notification
}: {
  notification: NotificationResType;
}) {
  const { serializeParams } = useQueryParams();

  const body = useMemo(
    () => parseJSON<SubtitleNotificationType>(notification.body),
    [notification.body]
  );

  return (
    <Link
      className='flex flex-1 items-center justify-between gap-2 pl-1'
      href={renderListPageUrl(
        generatePath(route.videoLibrarySubtitle.getList.path, {
          id: body?.videoLibraryId || ''
        }),
        serializeParams({
          p_sourceType: body?.sourceType,
          p_videoName: body?.name
        })
      )}
    >
      <div className='relative aspect-video w-20 shrink-0'>
        <ImageField
          src={renderImageUrl(body?.thumbnailUrl)}
          alt={body?.name}
          aspect={16 / 9}
          disablePreview
          className='h-full'
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
