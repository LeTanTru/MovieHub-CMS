import { z } from 'zod';

// Base MQTT message envelope schema
export const mqttMessageSchema = z.object({
  cmd: z.string().min(1, 'cmd is required'),
  data: z.unknown()
});
