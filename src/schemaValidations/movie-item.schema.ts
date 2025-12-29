import { MOVIE_ITEM_KIND_SEASON } from '@/constants';
import z from 'zod';

export const movieItemSchema = z
  .object({
    description: z.string().nonempty('Bắt buộc'),
    kind: z.number({ error: 'Bắt buộc' }),
    label: z.string().optional().nullable(),
    movieId: z.string().optional().nullable(),
    ordering: z.number({ error: 'Bắt buộc' }),
    parentId: z.string().optional().nullable(),
    releaseDate: z.string().nonempty('Bắt buộc'),
    status: z.number({ error: 'Bắt buộc' }),
    thumbnailUrl: z.string().optional().nullable(),
    title: z.string().nonempty('Bắt buộc'),
    videoId: z.string().optional().nullable()
  })
  .superRefine((data, ctx) => {
    if (data.kind !== MOVIE_ITEM_KIND_SEASON && !data.parentId) {
      ctx.addIssue({
        path: ['parentId'],
        code: z.ZodIssueCode.custom,
        message: 'Bắt buộc'
      });
    }
  });

export const movieItemSearchSchema = z.object({
  kind: z.number().optional().nullable(),
  movieId: z.string().optional().nullable(),
  parentId: z.string().optional().nullable(),
  status: z.number().optional().nullable(),
  title: z.string().optional().nullable(),
  excludeKind: z.number().optional().nullable()
});
