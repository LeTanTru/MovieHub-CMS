import { z } from 'zod';

export const groupPermissionSchema = z.object({
  id: z.union([z.string(), z.number()]).optional(),
  name: z.string().nonempty('Bắt buộc')
});
