import z from 'zod';

export const videoLibrarySchema = z.object({
  content: z.string().nonempty('Bắt buộc'),
  description: z.string().nonempty('Bắt buộc'),
  introEnd: z.union([z.string(), z.number()]).nullable().optional(),
  introStart: z.union([z.string(), z.number()]).nullable().optional(),
  outroStart: z.union([z.string(), z.number()]).nullable().optional(),
  name: z.string().nonempty('Bắt buộc'),
  shortDescription: z.string().nonempty('Bắt buộc'),
  status: z.number({ error: 'Bắt buộc' }),
  thumbnailUrl: z.string().nonempty('Bắt buộc'),
  sourceType: z.number({ error: 'Bắt buộc' }),
  duration: z.union([z.string(), z.number()]).nullable().optional()
});

export const videoLibrarySearchSchema = z.object({
  name: z.string().optional().nullable(),
  state: z.number().optional().nullable()
});
