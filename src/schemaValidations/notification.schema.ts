import z from 'zod';

export const updateReadNotificationSchema = z.object({
  ids: z.array(z.string())
});
