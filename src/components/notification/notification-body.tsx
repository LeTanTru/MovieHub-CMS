import { ConvertVideoBody } from './convert-video-body';
import { mqttCMDs } from '@/constants';
import { NotificationResType } from '@/types';
import { ProcessAudioBody } from './process-audio-body';
import { ReplyCommentBody } from './reply-comment-body';
import { ReportVideoBody } from './report-video-body';
import { SubtitleBody } from './subtitle-body';
import { ToxicCommentLockedBody } from './toxic-comment-locked-body';
import { UserReportBody } from './user-report-body';
import { VoteCommentBody } from './vote-comment-body';

export function NotificationBody({
  notification
}: {
  notification: NotificationResType;
}) {
  switch (notification.cmd) {
    case mqttCMDs.DONE_CONVERT_AUDIO: {
      return <ProcessAudioBody notification={notification} />;
    }

    case mqttCMDs.DONE_CONVERT_VIDEO: {
      return <ConvertVideoBody notification={notification} />;
    }

    case mqttCMDs.DONE_PROCESS_SUBTITLE: {
      return <SubtitleBody notification={notification} />;
    }

    case mqttCMDs.NEW_USER_REPORT: {
      return <UserReportBody notification={notification} />;
    }

    case mqttCMDs.NEW_VIDEO_REPORT: {
      return <ReportVideoBody notification={notification} />;
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
