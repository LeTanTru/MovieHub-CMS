import { getMqttClient } from '@/lib/mqtt';
import { logger } from '@/logger';
import { useEffect, useRef } from 'react';

type UseMqttType<T> = {
  topic: string;
  cmd: string;
  callback: (data: T) => void;
};

const useMqtt = <T>({ topic, cmd, callback }: UseMqttType<T>) => {
  const callbackRef = useRef(callback);
  callbackRef.current = callback;
  const client = getMqttClient();

  useEffect(() => {
    const handleMessage = (incomingTopic: string, message: Buffer) => {
      if (incomingTopic !== topic) return;

      try {
        const parsedData: { cmd: string; data: T } = JSON.parse(
          message.toString()
        );
        if (parsedData.cmd === cmd) {
          callbackRef.current(parsedData.data);
        } else {
          logger.warn(
            `[MQTT_WARNING] Received ${parsedData.cmd}, expected: ${cmd}, message: ${message}`
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

export default useMqtt;
