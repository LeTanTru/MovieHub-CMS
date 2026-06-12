import { AudioBody } from './audio-body';
import { ConvertVideoBody } from './convert-video-body';
import { mqttCMDs } from '@/constants';
import { NotificationResType } from '@/types';
import { ReplyCommentBody } from './reply-comment-body';
import { SubtitleBody } from './subtitle-body';
import { ToxicCommentLockedBody } from './toxic-comment-locked-body';
import { VoteCommentBody } from './vote-comment-body';

export function NotificationBody({
  notification
}: {
  notification: NotificationResType;
}) {
  switch (notification.cmd) {
    case mqttCMDs.DONE_CONVERT_AUDIO: {
      return <AudioBody notification={notification} />;
    }
    case mqttCMDs.DONE_PROCESS_SUBTITLE: {
      return <SubtitleBody notification={notification} />;
    }
    case mqttCMDs.DONE_CONVERT_VIDEO: {
      return <ConvertVideoBody notification={notification} />;
    }
    case mqttCMDs.REPLY_COMMENT: {
      return <ReplyCommentBody notification={notification} />;
    }
    case mqttCMDs.TOXIC_COMMENT_LOCKED: {
      return <ToxicCommentLockedBody notification={notification} />;
    }
    case mqttCMDs.VOTE_COMMENT: {
      return <VoteCommentBody notification={notification} />;
    }

    default:
      return null;
  }
}
