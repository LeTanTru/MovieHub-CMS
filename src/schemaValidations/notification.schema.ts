import z from 'zod';

export const updateReadNotificationSchema = z.object({
  ids: z.array(z.string())
});

export const notificationSearchSchema = z.object({
  accountId: z.string().optional().nullable(),
  isRead: z.boolean().optional().nullable(),
  type: z.number().optional().nullable()
});
