import envConfig from '@/config';
import { logger } from '@/logger';
import mqtt, { MqttClient } from 'mqtt';

let client: MqttClient;

export const getMqttClient = () => {
  if (!client) {
    client = mqtt.connect(envConfig.NEXT_PUBLIC_MQTT_BROKER as string, {
      username: envConfig.NEXT_PUBLIC_MQTT_USERNAME as string,
      password: envConfig.NEXT_PUBLIC_MQTT_PASSWORD as string,
      reconnectPeriod: 3000,
      connectTimeout: 30000,
      keepalive: 60
    });

    client.on('connect', (e) => logger.info('MQTT connected', e));
    client.on('error', (err) => logger.error('[MQTT_ERROR]', err));
    client.on('reconnect', () => logger.info('[MQTT] Reconnecting...'));
    client.on('offline', () => logger.warn('[MQTT] Offline'));
    client.on('close', () => logger.info('[MQTT] Disconnected'));
  }
  return client;
};
