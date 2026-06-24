import { z } from 'zod';

export const moviePersonSchema = z.object({
  id: z.string().optional().nullable(),
  characterName: z.string().optional().nullable(),
  kind: z.number({ error: 'Bắt buộc' }),
  movieId: z.string().nonempty('Bắt buộc'),
  personId: z.string().nonempty('Bắt buộc')
});

export const moviePersonSearchSchema = z.object({
  kind: z.number().optional().nullable(),
  movieId: z.string().optional().nullable(),
  personId: z.string().optional().nullable()
});
