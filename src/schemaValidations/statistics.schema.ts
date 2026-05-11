import z from 'zod';

export const statisticGroupBySchema = z.enum([
  'type',
  'country',
  'language',
  'ageRating'
]);

export const statisticSortBySchema = z.enum([
  'viewCount',
  'commentCount',
  'reviewCount',
  'averageRating'
]);

export const movieDistributonSearchSchema = z.object({
  groupBy: statisticGroupBySchema.nullable().optional()
});

export const overviewSearchSchema = z.object({
  fromDate: z.string().nullable().optional(),
  toDate: z.string().nullable().optional()
});

export const topMoviesSchema = z.object({
  fromDate: z.string().nullable().optional(),
  toDate: z.string().nullable().optional(),
  sortBy: statisticSortBySchema.nullable().optional(),
  page: z.number().optional(),
  size: z.number().optional()
});
