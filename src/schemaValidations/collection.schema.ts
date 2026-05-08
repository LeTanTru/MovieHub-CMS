import { z } from 'zod';

export const collectionFilterSchema = z.object({
  ageRating: z.number().optional().nullable(),
  categoryIds: z.array(z.string()).optional().nullable(),
  comingSoon: z.boolean().optional().nullable(),
  country: z.string().optional().nullable(),
  isFeatured: z.boolean().optional().nullable(),
  language: z.string().optional().nullable(),
  limit: z.number().optional().nullable(),
  noLimit: z.boolean().optional().nullable(), // just display on UI, not include in payload
  topImdb: z.boolean().optional().nullable(),
  type: z.number().optional().nullable()
});

export const collectionSchema = z.object({
  colors: z.array(z.string()),
  filter: collectionFilterSchema,
  name: z.string().nonempty('Bắt buộc'),
  randomData: z.boolean({ error: 'Bắt buộc' }),
  styleId: z.string().nonempty('Bắt buộc'),
  type: z.number({ error: 'Bắt buộc' }),
  fillData: z.boolean().optional().nullable()
});

export const collectionSearchSchema = z.object({
  name: z.string().optional().nullable(),
  styleId: z.string().optional().nullable(),
  type: z.number().optional().nullable()
});
