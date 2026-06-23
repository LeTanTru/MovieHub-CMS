import { AvatarField, ImageField } from '@/components/form';
import { USER_REPORT_TYPE_COMMENT } from '@/constants';
import { useQueryParams } from '@/hooks';
import { route } from '@/routes';
import { useCommentStore, useReviewStore } from '@/store';
import { NotificationResType, UserReportNotificationType } from '@/types';
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

export function UserReportBody({
  notification
}: {
  notification: NotificationResType;
}) {
  const body = useMemo(
    () => parseJSON<UserReportNotificationType>(notification.body),
    [notification.body]
  );

  const { serializeParams } = useQueryParams();
  const setOpenParentIds = useCommentStore((s) => s.setOpenParentIds);
  const setCommentScrollTarget = useCommentStore((s) => s.setScrollTarget);
  const setReviewScrollTarget = useReviewStore((s) => s.setScrollTarget);

  const isComment = body?.type === USER_REPORT_TYPE_COMMENT;

  const href = renderListPageUrl(
    generatePath(
      isComment ? route.comment.getList.path : route.review.getList.path,
      { id: body?.movieId || '' }
    ),
    serializeParams({ movieTitle: body?.movieTitle })
  );

  const handleClick = () => {
    if (isComment) {
      const parentId = body?.parentId;

      if (parentId) {
        setOpenParentIds((prev) =>
          prev.includes(parentId) ? prev : [...prev, parentId]
        );
      }

      setCommentScrollTarget({ commentId: body?.objectId, parentId });
    } else {
      setReviewScrollTarget({ reviewId: body?.objectId });
    }
  };

  return (
    <Link
      onClick={handleClick}
      className='flex flex-1 items-center justify-between gap-2 pl-1'
      href={href}
    >
      <div className='flex flex-1 items-center gap-2'>
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
            {notification.title}
            {body?.content ? (
              <>
                :&nbsp;&quot;
                <span className='font-normal'>{body.content}</span>
                &quot;
              </>
            ) : null}
            {body?.movieTitle ? (
              <>
                &nbsp;trong phim&nbsp;
                <span className='font-semibold'>{body.movieTitle}</span>
              </>
            ) : null}
          </h3>
          <div
            className='text-muted-foreground mt-2 shrink-0 text-xs'
            title={convertUTCToLocal(notification.createdDate)}
          >
            {timeAgo(notification.createdDate)}
          </div>
        </div>
      </div>
      <div className='relative aspect-video w-20 shrink-0'>
        <ImageField
          src={renderImageUrl(body?.movieThumbnail)}
          alt={body?.movieTitle}
          aspect={16 / 9}
          disablePreview
          className='h-full'
        />
      </div>
    </Link>
  );
}
