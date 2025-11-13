import z from 'zod';

export const categorySchema = z.object({
  name: z.string().nonempty('Bắt buộc'),
  status: z.number({ error: 'Bắt buộc' })
});

export const categorySearchSchema = z.object({
  name: z.string().optional().nullable(),
  status: z.number().optional().nullable()
});
