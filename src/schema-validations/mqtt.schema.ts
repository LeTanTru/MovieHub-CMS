import { z } from 'zod';

// Base MQTT message envelope schema
export const mqttMessageSchema = z.object({
  cmd: z.string().min(1, 'cmd is required'),
  data: z.unknown()
});

// Notification data schema (used for CMS and account notifications)
export const mqttNotificationDataSchema = z.object({
  id: z.string().optional(),
  cmd: z.string().optional(),
  title: z.string().optional().default(''),
  body: z.string().optional().default(''),
  type: z.number().optional(),
  status: z.number().optional(),
  isRead: z.boolean().optional(),
  createdDate: z.string().optional(),
  modifiedDate: z.string().optional()
});

// Strict notification data schema for sanitization
export const mqttStrictNotificationDataSchema = z.object({
  id: z.string().optional(),
  cmd: z.string().optional(),
  title: z.string().max(500, 'title too long').optional().default(''),
  body: z.string().max(5000, 'body too long').optional().default(''),
  type: z.number().int().optional(),
  status: z.number().int().optional(),
  isRead: z.boolean().optional(),
  createdDate: z.string().datetime().optional().or(z.string().optional()),
  modifiedDate: z.string().datetime().optional().or(z.string().optional())
});

export type MqttMessageType = z.infer<typeof mqttMessageSchema>;
export type MqttNotificationDataType = z.infer<
  typeof mqttNotificationDataSchema
>;
