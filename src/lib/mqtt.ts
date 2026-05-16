import envConfig from '@/config';
import { logger } from '@/logger';
import mqtt, { MqttClient } from 'mqtt';

let client: MqttClient;
const MQTT_RECONNECT_PERIOD = 3000;
const MQTT_CONNECT_TIMEOUT = 30000;
const MQTT_KEEPALIVE = 60;

export const getMqttClient = () => {
  if (!client) {
    client = mqtt.connect(envConfig.NEXT_PUBLIC_MQTT_BROKER as string, {
      username: envConfig.NEXT_PUBLIC_MQTT_USERNAME as string,
      password: envConfig.NEXT_PUBLIC_MQTT_PASSWORD as string,
      reconnectPeriod: MQTT_RECONNECT_PERIOD,
      connectTimeout: MQTT_CONNECT_TIMEOUT,
      keepalive: MQTT_KEEPALIVE
    });

    client.on('connect', (e) => logger.info('MQTT connected', e));
    client.on('error', (err) => logger.error('[MQTT_ERROR]', err));
    client.on('reconnect', () => logger.info('[MQTT] Reconnecting...'));
    client.on('offline', () => logger.warn('[MQTT] Offline'));
    client.on('close', () => logger.info('[MQTT] Disconnected'));
  }
  return client;
};
