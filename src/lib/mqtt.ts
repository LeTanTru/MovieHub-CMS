import { logger } from '@/logger';
import mqtt, { MqttClient } from 'mqtt';

let client: MqttClient;

export const getMqttClient = () => {
  if (!client) {
    client = mqtt.connect(process.env.NEXT_PUBLIC_MQTT_BROKER as string, {
      username: process.env.NEXT_PUBLIC_MQTT_USERNAME as string,
      password: process.env.NEXT_PUBLIC_MQTT_PASSWORD as string
    });

    client.on('connect', (e) => logger.info('MQTT connected', e));
    client.on('error', (err) => logger.error('MQTT error:', err));
  }
  return client;
};
