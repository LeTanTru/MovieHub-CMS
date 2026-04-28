import { z } from 'zod';

export const settingSchema = z.object({
  dataType: z.string().nonempty('Bắt buộc'),
  description: z.string().nonempty('Bắt buộc'),
  groupName: z.string().nonempty('Bắt buộc'),
  isSystem: z.boolean(),
  keyName: z.string().nonempty('Bắt buộc'),
  options: z.string().optional().nullable(),
  valueData: z.coerce.string().nonempty('Bắt buộc')
});

export const settingSearchSchema = z.object({
  dataType: z.string().optional().nullable(),
  groupName: z.string().optional().nullable(),
  isSystem: z.boolean().optional().nullable(),
  keyName: z.string().optional().nullable(),
  valueData: z.string().optional().nullable()
});
