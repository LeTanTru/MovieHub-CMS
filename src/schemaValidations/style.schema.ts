import z from 'zod';

export const styleSchema = z.object({
  description: z.string().nonempty('Bắt buộc'),
  imageUrl: z.string().nonempty('Bắt buộc'),
  isDefault: z.boolean(),
  name: z.string().nonempty('Bắt buộc'),
  type: z.number({ error: 'Bắt buộc' })
});

export const styleSearchSchema = z.object({});
