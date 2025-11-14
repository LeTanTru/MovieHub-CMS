import z from 'zod';

export const videoLibrarySchema = z.object({
  content: z.string().nonempty('Bắt buộc'),
  description: z.string().nonempty('Bắt buộc'),
  introEnd: z.number({ error: 'Bắt buộc' }),
  introStart: z.number({ error: 'Bắt buộc' }),
  name: z.string().nonempty('Bắt buộc'),
  shortDescription: z.string().nonempty('Bắt buộc'),
  status: z.number({ error: 'Bắt buộc' }),
  thumbnailUrl: z.string().nonempty('Bắt buộc')
});

export const videoLibrarySearchSchema = z.object({
  name: z.string().optional().nullable(),
  state: z.number().optional().nullable()
});
