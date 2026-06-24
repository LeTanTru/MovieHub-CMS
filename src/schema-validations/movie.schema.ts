import { MOVIE_TYPE_SERIES } from '@/constants';
import { z } from 'zod';

const sendNotificationConfigSchema = z
  .object({
    isSendNotification: z.boolean().default(false),
    scheduleAt: z.string().optional().nullable(),
    sendFor: z.number().optional().nullable(),
    title: z.string().optional().nullable()
  })
  .optional()
  .nullable();

export const movieSchema = z
  .object({
    ageRating: z.number({ error: 'Bắt buộc' }).min(1, 'Bắt buộc'),
    categoryIds: z
      .array(z.string(), { error: 'Bắt buộc' })
      .nonempty('Bắt buộc'),
    country: z.string().nonempty('Bắt buộc'),
    description: z.string().nonempty('Bắt buộc'),
    duration: z.number().optional().nullable(),
    imageTitleUrl: z.string().optional().nullable(),
    isFeatured: z.boolean(),
    language: z.string().nonempty('Bắt buộc'),
    originalTitle: z.string().nonempty('Bắt buộc'),
    imdbId: z.string().optional().nullable(),
    posterUrl: z.string().nonempty('Bắt buộc'),
    releaseDate: z.string().nonempty('Bắt buộc'),
    sendNotificationConfig: sendNotificationConfigSchema,
    status: z.number({ error: 'Bắt buộc' }),
    thumbnailUrl: z.string().nonempty('Bắt buộc'),
    title: z.string().nonempty('Bắt buộc'),
    type: z.number({ error: 'Bắt buộc' }).min(1, 'Bắt buộc'),
    year: z.number({ error: 'Bắt buộc' })
  })
  .superRefine((data, ctx) => {
    if (data.type === MOVIE_TYPE_SERIES) {
      if (!data.duration) {
        ctx.addIssue({
          path: ['duration'],
          code: z.ZodIssueCode.custom,
          message: 'Bắt buộc'
        });
      }
    }
  });

export const movieSearchSchema = z.object({
  ageRating: z.number().optional().nullable(),
  categoryIds: z.array(z.string()).optional().nullable(),
  collectionId: z.string().optional().nullable(),
  country: z.string().optional().nullable(),
  excludeIds: z.array(z.string()).optional().nullable(),
  id: z.string().optional().nullable(),
  isFeatured: z.boolean().optional().nullable(),
  keyword: z.string().optional().nullable(),
  language: z.string().optional().nullable(),
  originalTitle: z.string().optional().nullable(),
  releaseYear: z.number().optional().nullable(),
  title: z.string().optional().nullable(),
  type: z.number().optional().nullable()
});
