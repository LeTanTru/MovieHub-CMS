import z from 'zod';

const filterSchema = z.object({
  type: z.number().optional().nullable(),
  ageRating: z.number().optional().nullable(),
  language: z.string().optional().nullable(),
  country: z.string().optional().nullable(),
  isFeatured: z.boolean().optional().nullable(),
  categoryIds: z.array(z.string()).optional().nullable(),
  limit: z.number().optional().nullable(),
  noLimit: z.boolean().optional().nullable()
});

export const collectionSchema = z.object({
  colors: z.array(z.string()),
  filter: filterSchema,
  name: z.string().nonempty('Bắt buộc'),
  randomData: z.boolean(),
  styleId: z.string(),
  type: z.number()
});

export const collectionSearchSchema = z.object({
  name: z.string().optional().nullable(),
  style: z.string().optional().nullable(),
  type: z.number().optional().nullable()
});
