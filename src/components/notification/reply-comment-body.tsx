import { AvatarField, ImageField } from '@/components/form';
import { useQueryParams } from '@/hooks';
import { route } from '@/routes';
import { useCommentStore } from '@/store';
import { NotificationResType, ReplyCommentNotificationType } from '@/types';
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

export default function ReplyCommentBody({
  notification
}: {
  notification: NotificationResType;
}) {
  const body = useMemo(
    () => parseJSON<ReplyCommentNotificationType>(notification.body),
    [notification.body]
  );
  const { serializeParams } = useQueryParams();
  const setOpenParentIds = useCommentStore((s) => s.setOpenParentIds);
  const setScrollTarget = useCommentStore((s) => s.setScrollTarget);

  const handleClick = () => {
    if (body?.parentId) {
      setOpenParentIds((prev) =>
        prev.includes(body.parentId) ? prev : [...prev, body.parentId]
      );
    }
    setScrollTarget({ commentId: body?.id, parentId: body?.parentId });
  };

  return (
    <Link
      onClick={handleClick}
      className='flex flex-1 items-center justify-between gap-2'
      href={renderListPageUrl(
        generatePath(route.comment.getList.path, {
          id: body?.movieId || ''
        }),
        serializeParams({
          movieTitle: body?.movieTitle
        })
      )}
    >
      <div className='flex w-20 shrink-0 justify-center'>
        <AvatarField
          size={40}
          src={renderImageUrl(body?.author?.avatarPath)}
          alt={body?.author?.fullName || body?.author?.username}
          disablePreview
        />
      </div>
      <div className='flex flex-1 flex-col justify-between'>
        <h3 className='line-clamp-2 font-medium' title={notification.title}>
          {notification.title}:&nbsp;&quot;
          <span className='font-normal'>{body?.content}</span>
          &quot;
        </h3>
        <div
          className='text-muted-foreground shrink-0 text-xs'
          title={convertUTCToLocal(notification.createdDate)}
        >
          {timeAgo(notification.createdDate)}
        </div>
      </div>
      <div className='relative w-20 shrink-0'>
        <ImageField
          src={renderImageUrl(body?.movieThumbnail)}
          alt={body?.movieTitle}
          aspect={16 / 9}
          disablePreview
        />
      </div>
    </Link>
  );
}
