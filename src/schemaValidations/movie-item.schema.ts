import { MOVIE_ITEM_KIND_SEASON, MOVIE_TYPE_SERIES } from '@/constants';
import { z } from 'zod';

const sendNotificationConfigSchema = z
  .object({
    isSendNotification: z.boolean(),
    scheduleAt: z.string().optional().nullable(),
    sendFor: z.number().optional().nullable(),
    title: z.string().optional().nullable()
  })
  .optional()
  .nullable();

export const movieItemSchema = (movieType: number) =>
  z
    .object({
      description: z.string().nonempty('Bắt buộc'),
      isLatest: z.boolean().default(false),
      kind: z.number({ error: 'Bắt buộc' }),
      label: z.string().nonempty('Bắt buộc'),
      movieId: z.string().optional().nullable(),
      parentId: z.string().optional().nullable(),
      releaseDate: z.string().nonempty('Bắt buộc'),
      sendNotificationConfig: sendNotificationConfigSchema,
      status: z.number({ error: 'Bắt buộc' }),
      thumbnailUrl: z.string().optional().nullable(),
      title: z.string().nonempty('Bắt buộc'),
      videoId: z.string().optional().nullable(),
      totalEpisode: z.number().optional().nullable()
    })
    .superRefine((data, ctx) => {
      if (data.kind !== MOVIE_ITEM_KIND_SEASON && !data.parentId) {
        ctx.addIssue({
          path: ['parentId'],
          code: z.ZodIssueCode.custom,
          message: 'Bắt buộc'
        });
      }

      if (
        data.kind === MOVIE_ITEM_KIND_SEASON &&
        movieType === MOVIE_TYPE_SERIES &&
        !data.totalEpisode
      ) {
        ctx.addIssue({
          path: ['totalEpisode'],
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
