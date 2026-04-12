import { getMqttClient } from '@/lib/mqtt';
import { logger } from '@/logger';
import { useEffect, useRef } from 'react';

type UseMqttType<T> = {
  topic: string;
  cmd: string;
  callback: (message: { cmd: string; data: T }) => void;
};

const useMqtt = <T>({ topic, cmd, callback }: UseMqttType<T>) => {
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  useEffect(() => {
    const client = getMqttClient();

    client.subscribe(topic, (err) => {
      if (!err) logger.info(`Subscribed to MQTT topic: ${topic}`);
      else logger.error(`Failed to subscribe to MQTT topic: ${topic}`, err);
    });

    const handleMessage = (_topic: string, message: Buffer) => {
      if (_topic !== topic) return;
      logger.info(
        `Received MQTT message on topic: ${topic}`,
        message.toString()
      );
      try {
        const parsedMessage = JSON.parse(message.toString());
        if (parsedMessage.cmd === cmd) {
          callbackRef.current(parsedMessage);
        } else {
          logger.warn(`Unexpected cmd: ${parsedMessage.cmd}, expected: ${cmd}`);
        }
      } catch (error) {
        logger.error(`Error parsing MQTT message on topic: ${topic}`, error);
      }
    };

    client.on('message', handleMessage);

    return () => {
      client.off('message', handleMessage);
      client.unsubscribe(topic);
    };
  }, [topic, cmd]);
};

export default useMqtt;
