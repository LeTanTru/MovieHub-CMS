'use client';

import { mqttCMDs, mqttTopics, queryKeys } from '@/constants';
import { useAuth, useMqtt } from '@/hooks';
import { getMqttClient } from '@/lib/mqtt';
import { logger } from '@/logger';
import { mqttMessageSchema } from '@/schemaValidations';
import { NotificationResType } from '@/types';
import { generateMqttTopic, invalidateQueries, notify } from '@/utils';
import { useEffect } from 'react';

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

  // Receive message from CMS
  useEffect(() => {
    const onMessage = (topic: string, message: Buffer) => {
      try {
        const raw = JSON.parse(message.toString());
        const parsed = mqttMessageSchema.safeParse(raw);

        if (parsed.success) {
          logger.info(`[MQTT] Received MQTT message on topic: ${topic}`, {
            cmd: parsed.data.cmd
          });
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
      switch (data.cmd) {
        case mqttCMDs.DONE_CONVERT_VIDEO:
        case mqttCMDs.DONE_CONVERT_AUDIO: {
          invalidateQueries(
            [queryKeys.UNREAD_NOTIFICATION_COUNT],
            [queryKeys.NOTIFICATION_INFINITE],
            [queryKeys.VIDEO_LIBRARY_LIST]
          );
          notify.success(data.title);
          break;
        }
        case mqttCMDs.DONE_PROCESS_SUBTITLE: {
          invalidateQueries(
            [queryKeys.UNREAD_NOTIFICATION_COUNT],
            [queryKeys.NOTIFICATION_INFINITE],
            [queryKeys.VIDEO_LIBRARY_SUBTITLE_LIST]
          );
          notify.success(data.title);
          break;
        }
      }
    }
  });

  // Subscribe to per-account notifications
  useMqtt<NotificationResType>({
    topic: generateMqttTopic(mqttTopics.ACCOUNT, {
      accountId: profile?.id || ''
    }),
    cmd: mqttCMDs.SEND_NOTIFICATION,
    callback: (data) => {
      switch (data.cmd) {
        case mqttCMDs.REPLY_COMMENT:
        case mqttCMDs.VOTE_COMMENT: {
          invalidateQueries(
            [queryKeys.UNREAD_NOTIFICATION_COUNT],
            [queryKeys.NOTIFICATION_INFINITE]
          );
          notify.success(data.title);
          break;
        }
      }
    }
  });

  return null;
}
