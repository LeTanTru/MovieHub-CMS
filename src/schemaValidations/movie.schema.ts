import z from 'zod';

export const movieSchema = z.object({
  ageRating: z.number({ error: 'Bắt buộc' }),
  categoryIds: z.array(z.string(), { error: 'Bắt buộc' }),
  country: z.string().nonempty('Bắt buộc'),
  description: z.string().nonempty('Bắt buộc'),
  isFeatured: z.boolean(),
  language: z.string().nonempty('Bắt buộc'),
  originalTitle: z.string().nonempty('Bắt buộc'),
  posterUrl: z.string().nonempty('Bắt buộc'),
  releaseDate: z.string().nonempty('Bắt buộc'),
  status: z.number({ error: 'Bắt buộc' }),
  thumbnailUrl: z.string().nonempty('Bắt buộc'),
  title: z.string().nonempty('Bắt buộc'),
  type: z.number({ error: 'Bắt buộc' })
});

export const movieSearchSchema = z.object({
  ageRating: z.number().optional().nullable(),
  originalTitle: z.number().optional().nullable(),
  title: z.string().optional().nullable(),
  language: z.string().optional().nullable(),
  country: z.string().optional().nullable(),
  type: z.number().optional().nullable()
});
