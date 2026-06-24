import { z } from 'zod';

export const userReportSearchSchema = z.object({
  authorId: z.string().optional().nullable(),
  objectId: z.string().optional().nullable(),
  type: z.number().optional().nullable()
});
