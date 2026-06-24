import { z } from 'zod';

export const baseSearchSchema = z.object({
  page: z.number().optional(),
  size: z.number().optional()
});
