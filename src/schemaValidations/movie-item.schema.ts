import z from 'zod';

export const movieItemSchema = z.object({
  description: z.string().nonempty('Bắt buộc'),
  kind: z.number({ error: 'Bắt buộc' }),
  label: z.string().optional().nullable(),
  movieId: z.string().optional().nullable(),
  ordering: z.number({ error: 'Bắt buộc' }),
  parentId: z.string().optional().nullable(),
  releaseDate: z.string().nonempty('Bắt buộc'),
  status: z.number({ error: 'Bắt buộc' }),
  thumbnailUrl: z.string().nonempty('Bắt buộc'),
  title: z.string().nonempty('Bắt buộc'),
  videoId: z.string().optional().nullable()
});

export const movieItemSearchSchema = z.object({
  kind: z.number().optional().nullable(),
  movieId: z.string().optional().nullable(),
  parentId: z.string().optional().nullable(),
  status: z.number().optional().nullable(),
  title: z.string().optional().nullable()
});
