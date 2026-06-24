import { z } from 'zod';

export const serverConfigSchema = z.object({
  hostname: z.string().nonempty('Bắt buộc'),
  ip: z.string().nonempty('Bắt buộc'),
  name: z.string().nonempty('Bắt buộc'),
  port: z.number().int().nonnegative('Cổng phải là số nguyên dương'),
  serverNumber: z
    .number()
    .int()
    .nonnegative('Máy chủ No. phải là số nguyên dương'),
  status: z
    .number({ error: 'Bắt buộc' })
    .int({ error: 'Trạng thái phải là số nguyên' })
});

export const serverConfigSearchSchema = z.object({
  hostname: z.string().optional(),
  ip: z.string().optional(),
  name: z.string().optional(),
  port: z.number().optional(),
  serverNumber: z.number().optional(),
  status: z.number().optional()
});
