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
  const client = getMqttClient();

  useEffect(() => {
    const handleMessage = (incomingTopic: string, message: Buffer) => {
      if (incomingTopic !== topic) return;

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
    };
  }, [topic, cmd, client]);
};

export default useMqtt;
