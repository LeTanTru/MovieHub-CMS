import { getMqttClient } from '@/lib/mqtt';
import { logger } from '@/logger';
import { mqttMessageSchema } from '@/schema-validations';
import { useEffect, useRef } from 'react';

type UseMqttType<T> = {
  topic: string;
  cmd: string;
  callback: (data: T) => void;
};

/**
 * Hook to subscribe to an MQTT topic and handle messages with a specific command.
 *
 * @param params - The MQTT subscription details.
 * @param params.topic - The MQTT topic to subscribe to.
 * @param params.cmd - The command key to check in the incoming message.
 * @param params.callback - The callback function invoked when a message with matching command is received.
 */
export const useMqtt = <T>({ topic, cmd, callback }: UseMqttType<T>) => {
  const callbackRef = useRef(callback);
  callbackRef.current = callback;
  const client = getMqttClient();

  useEffect(() => {
    const handleMessage = (incomingTopic: string, message: Buffer) => {
      if (incomingTopic !== topic) return;

      try {
        const raw = JSON.parse(message.toString());
        const parsed = mqttMessageSchema.safeParse(raw);

        if (!parsed.success) {
          logger.warn(
            `[MQTT_WARNING] Invalid message schema on topic ${topic}`
          );
          return;
        }

        if (parsed.data.cmd === cmd) {
          callbackRef.current(parsed.data.data as T);
        } else {
          logger.warn(
            `[MQTT_WARNING] Received ${parsed.data.cmd}, expected: ${cmd}`
          );
        }
      } catch (error) {
        logger.error(`[MQTT_PARSE_ERROR] ${topic}: ${error}`);
      }
    };

    client.on('message', handleMessage);

    return () => {
      client.off('message', handleMessage);
    };
  }, [topic, cmd, client]);
};

export const useMqttSubscribe = (topic: string, enabled: boolean = true) => {
  const client = getMqttClient();

  useEffect(() => {
    if (!enabled || !topic) return;

    const subscribe = () => {
      client.subscribe(topic, (err) => {
        if (!err) {
          logger.info(`[MQTT] Subscribed to MQTT topic: ${topic}`);
        } else {
          logger.error(`[MQTT_SUBSCRIBE_ERROR] ${topic}`, err);
        }
      });
    };

    // If already connected, subscribe immediately; otherwise wait for connect
    if (client.connected) {
      subscribe();
    } else {
      client.once('connect', subscribe);
    }

    // Re-subscribe after every reconnect
    client.on('connect', subscribe);

    return () => {
      client.off('connect', subscribe);
      if (client.connected) {
        client.unsubscribe(topic);
      }
    };
  }, [client, enabled, topic]);
};
