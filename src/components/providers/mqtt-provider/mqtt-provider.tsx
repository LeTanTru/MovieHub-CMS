'use client';

import { mqttCMDs, mqttTopics, queryKeys } from '@/constants';
import { useAuth, useMqtt } from '@/hooks';
import { getMqttClient } from '@/lib/mqtt';
import { logger } from '@/logger';
import { NotificationResType } from '@/types';
import {
  generateMqttTopic,
  invalidateQueries,
  notify,
  parseJSON
} from '@/utils';
import { useEffect } from 'react';

export default function MqttProvider() {
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
      logger.info(
        `[MQTT] Received MQTT message on topic: ${topic}`,
        parseJSON(message.toString())
      );
    };

    client.on('message', onMessage);

    return () => {
      client.off('message', onMessage);
    };
  }, [client]);

  // Subscribe to video library notification
  useMqtt<NotificationResType>({
    topic: mqttTopics.CMS,
    cmd: mqttCMDs.SEND_NOTIFICATION,
    callback: (data) => {
      if (data.cmd === mqttCMDs.DONE_CONVERT_VIDEO) {
        invalidateQueries([
          queryKeys.UNREAD_NOTIFICATION_COUNT,
          queryKeys.NOTIFICATION_INFINITE,
          queryKeys.VIDEO_LIBRARY_LIST
        ]);
        notify.success(data.title);
      }
    }
  });

  // Subscribe to reply comment notification
  useMqtt<NotificationResType>({
    topic: generateMqttTopic(mqttTopics.ACCOUNT, {
      accountId: profile?.id || ''
    }),
    cmd: mqttCMDs.SEND_NOTIFICATION,
    callback: (data) => {
      if (data.cmd === mqttCMDs.REPLY_COMMENT) {
        invalidateQueries([
          queryKeys.UNREAD_NOTIFICATION_COUNT,
          queryKeys.NOTIFICATION_INFINITE
        ]);
      }
    }
  });

  useMqtt<NotificationResType>({
    topic: generateMqttTopic(mqttTopics.ACCOUNT, {
      accountId: profile?.id || ''
    }),
    cmd: mqttCMDs.SEND_NOTIFICATION,
    callback: (data) => {
      if (data.cmd === mqttCMDs.VOTE_COMMENT) {
        invalidateQueries([
          queryKeys.UNREAD_NOTIFICATION_COUNT,
          queryKeys.NOTIFICATION_INFINITE
        ]);
      }
    }
  });

  return null;
}
