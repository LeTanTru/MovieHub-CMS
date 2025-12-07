import z from 'zod';

export const reviewSearchSchema = z.object({
  authorId: z.string().optional().nullable(),
  movieId: z.string().nonempty('Bắt buộc'),
  rate: z.string().optional().nullable()
});
