import { AvatarField, ImageField } from '@/components/form';
import { route } from '@/routes';
import { NotificationResType, VoteCommentNotificationType } from '@/types';
import {
  convertUTCToLocal,
  generatePath,
  parseJSON,
  renderImageUrl,
  renderListPageUrl,
  timeAgo
} from '@/utils';
import Link from 'next/link';

export default function VoteCommentBody({
  notification
}: {
  notification: NotificationResType;
}) {
  const body = parseJSON<VoteCommentNotificationType>(notification.body);

  return (
    <Link
      className='flex flex-1 items-center justify-between'
      href={renderListPageUrl(
        generatePath(route.comment.getList.path, {
          id: body?.movieId || ''
        }),
        `title=${body?.movieTitle}`
      )}
    >
      <div className='flex flex-1 items-center gap-2'>
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
            {notification.title}
          </h3>
          <div
            className='text-muted-foreground shrink-0 text-xs'
            title={convertUTCToLocal(notification.createdDate)}
          >
            {timeAgo(notification.createdDate)}
          </div>
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
