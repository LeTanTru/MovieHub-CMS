import { mqttCMDs } from '@/constants';
import { NotificationResType } from '@/types';
import AudioBody from './audio-body';
import ConvertVideoBody from './convert-video-body';
import ReplyCommentBody from './reply-comment-body';
import VoteCommentBody from './vote-comment-body';

export default function NotificationBody({
  notification
}: {
  notification: NotificationResType;
}) {
  switch (notification.cmd) {
    case mqttCMDs.DONE_CONVERT_AUDIO: {
      return <AudioBody notification={notification} />;
    }
    case mqttCMDs.DONE_CONVERT_VIDEO: {
      return <ConvertVideoBody notification={notification} />;
    }
    case mqttCMDs.REPLY_COMMENT: {
      return <ReplyCommentBody notification={notification} />;
    }
    case mqttCMDs.VOTE_COMMENT: {
      return <VoteCommentBody notification={notification} />;
    }
    default:
      return null;
  }
}
