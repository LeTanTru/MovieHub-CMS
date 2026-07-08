'use client';

import {
  AUDIO_STATE_ERROR,
  mqttCMDs,
  mqttTopics,
  queryKeys,
  VIDEO_LIBRARY_STATE_ERROR
} from '@/constants';
import { useAuth, useMqtt } from '@/hooks';
import { getMqttClient } from '@/lib/mqtt';
import { logger } from '@/logger';
import { mqttMessageSchema } from '@/schema-validations';
import type {
  ProcessAudioNotificationType,
  ConvertVideoNotificationType,
  NotificationResType,
  ReplyCommentNotificationType,
  ToxicCommentLockedNotificationType,
  VoteCommentNotificationType
} from '@/types';
import {
  generateMqttTopic,
  invalidateQueries,
  notify,
  parseJSON
} from '@/utils';
import { useEffect } from 'react';

type QueryKey = (string | number | object)[];

const commentListKey = (movieId: string): QueryKey => [
  queryKeys.COMMENT_INFINITE,
  { movieId }
];

const commentRepliesKey = (parentId?: string | null): QueryKey | null => {
  if (!parentId) return null;

  return [`${queryKeys.COMMENT}-${parentId}-infinite`, { parentId }];
};

const invalidateCommentQueries = ({
  movieId,
  parentId,
  includeVoteList = false
}: {
  movieId?: string;
  parentId?: string | null;
  includeVoteList?: boolean;
}) => {
  if (!movieId) return;

  const keys: QueryKey[] = [commentListKey(movieId)];
  const repliesKey = commentRepliesKey(parentId);

  if (repliesKey) keys.push(repliesKey);
  if (includeVoteList) keys.push([queryKeys.VOTE_COMMENT, movieId]);

  invalidateQueries(...keys);
};

const invalidateNotificationQueries = (...keys: QueryKey[]) => {
  invalidateQueries(
    [queryKeys.UNREAD_NOTIFICATION_COUNT],
    [queryKeys.NOTIFICATION_INFINITE],
    ...keys
  );
};

const isValidMqttCMD = (cmd: string) => Object.values(mqttCMDs).includes(cmd);

const cmsNotificationQueryKeys: Partial<Record<string, QueryKey>> = {
  [mqttCMDs.DONE_CONVERT_AUDIO]: [queryKeys.VIDEO_LIBRARY_LIST],
  [mqttCMDs.DONE_CONVERT_VIDEO]: [queryKeys.VIDEO_LIBRARY_LIST],
  [mqttCMDs.DONE_PROCESS_SUBTITLE]: [queryKeys.VIDEO_LIBRARY_SUBTITLE_LIST],
  [mqttCMDs.NEW_USER_REPORT]: [queryKeys.NOTIFICATION_INFINITE],
  [mqttCMDs.NEW_VIDEO_REPORT]: [queryKeys.NOTIFICATION_INFINITE]
};

export function MqttProvider() {
  const { profile } = useAuth();
  const client = getMqttClient();

  // Subscribe to general CMS notification
  useEffect(() => {
    client.subscribe(mqttTopics.CMS, (err) => {
      if (!err)
        logger.info(`[MQTT] Subscribed to MQTT topic: ${mqttTopics.CMS}`);
      else logger.error('[MQTT_SUBSCRIBE_ERROR]', mqttTopics.CMS, err);
    });

    return () => {
      client.unsubscribe(mqttTopics.CMS);
    };
  }, [client]);

  // Subscribe to account notification
  useEffect(() => {
    if (profile?.id) {
      client.subscribe(
        generateMqttTopic(mqttTopics.ACCOUNT, {
          accountId: profile.id
        }),
        (err) => {
          if (!err)
            logger.info(
              `[MQTT] Subscribed to MQTT topic: ${mqttTopics.ACCOUNT.replace(
                ':accountId',
                profile.id
              )}`
            );
          else
            logger.error(
              '[MQTT_SUBSCRIBE_ERROR]',
              mqttTopics.ACCOUNT.replace(':accountId', profile.id),
              err
            );
        }
      );
    }

    return () => {
      if (profile?.id) {
        client.unsubscribe(
          mqttTopics.ACCOUNT.replace(':accountId', profile.id)
        );
      }
    };
  }, [profile?.id, client]);

  // Log all incoming MQTT messages for debugging
  useEffect(() => {
    const onMessage = (topic: string, message: Buffer) => {
      try {
        const raw = JSON.parse(message.toString());
        const parsed = mqttMessageSchema.safeParse(raw);

        if (parsed.success) {
          logger.info(
            `[MQTT] Received MQTT message on topic: ${topic}`,
            parsed.data
          );
        } else {
          logger.warn(`[MQTT] Received invalid message on topic: ${topic}`);
        }
      } catch {
        logger.warn(`[MQTT] Received unparseable message on topic: ${topic}`);
      }
    };

    client.on('message', onMessage);

    return () => {
      client.off('message', onMessage);
    };
  }, [client]);

  // Subscribe to notifications (single hook, one parse, routes by data.cmd)
  useMqtt<NotificationResType>({
    topic: mqttTopics.CMS,
    cmd: mqttCMDs.SEND_NOTIFICATION,
    callback: (data) => {
      if (!isValidMqttCMD(data.cmd)) return;

      const queryKey = cmsNotificationQueryKeys[data.cmd];

      if (!queryKey) return;

      invalidateNotificationQueries(queryKey);

      if (data.cmd === mqttCMDs.DONE_CONVERT_VIDEO) {
        const body = parseJSON<ConvertVideoNotificationType>(data.body);
        if (body?.state === VIDEO_LIBRARY_STATE_ERROR) {
          notify.error(data.title);
          return;
        }
      }

      if (data.cmd === mqttCMDs.DONE_CONVERT_AUDIO) {
        const body = parseJSON<ProcessAudioNotificationType>(data.body);
        if (body?.state === AUDIO_STATE_ERROR) {
          notify.error(data.title);
          return;
        }
      }

      notify.success(data.title);
    }
  });

  // Subscribe to per-account notifications
  useMqtt<NotificationResType>({
    topic: generateMqttTopic(mqttTopics.ACCOUNT, {
      accountId: profile?.id || ''
    }),
    cmd: mqttCMDs.SEND_NOTIFICATION,
    callback: (data) => {
      if (!isValidMqttCMD(data.cmd)) return;

      switch (data.cmd) {
        case mqttCMDs.REPLY_COMMENT: {
          const body = parseJSON<ReplyCommentNotificationType>(data.body);

          invalidateNotificationQueries();
          notify.success(data.title);
          invalidateCommentQueries({
            movieId: body?.movieId,
            parentId: body?.parentId
          });
          break;
        }
        case mqttCMDs.TOXIC_COMMENT_LOCKED: {
          const body = parseJSON<ToxicCommentLockedNotificationType>(data.body);

          invalidateNotificationQueries();
          notify.success(data.title);
          invalidateCommentQueries({
            movieId: body?.movieId,
            parentId: body?.parentId
          });
          break;
        }
        case mqttCMDs.VOTE_COMMENT: {
          const body = parseJSON<VoteCommentNotificationType>(data.body);

          invalidateNotificationQueries();
          notify.success(data.title);
          invalidateCommentQueries({
            movieId: body?.movieId,
            parentId: body?.parentId,
            includeVoteList: true
          });
          break;
        }
      }
    }
  });

  return null;
}
