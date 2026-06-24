import { z } from 'zod';

export const permissionSchema = z.object({
  id: z.union([z.string(), z.number()]).optional(),
  action: z.string().nonempty('Bắt buộc'),
  description: z.string().nonempty('Bắt buộc'),
  groupPermissionId: z.string().nonempty('Bắt buộc').optional(),
  name: z.string().nonempty('Bắt buộc'),
  permissionCode: z.string().nonempty('Bắt buộc'),
  showMenu: z.boolean()
});
