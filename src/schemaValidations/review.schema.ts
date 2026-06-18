import { z } from 'zod';

export const reviewSearchSchema = z.object({
  authorId: z.string().optional().nullable(),
  movieId: z.string().nonempty('Bắt buộc'),
  rate: z.string().optional().nullable()
});

export const reviewToxicSpansSchema = z.object({
  id: z.string().nonempty('Bắt buộc'),
  toxic_spans: z.string().nonempty('Bắt buộc')
});
