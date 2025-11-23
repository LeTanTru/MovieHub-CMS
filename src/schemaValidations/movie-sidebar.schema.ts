import z from 'zod';

export const movieSidebarSchema = z.object({
  active: z.boolean(),
  description: z.string().nonempty('Bắt buộc'),
  mainColor: z.string(),
  mobileThumbnailUrl: z.string().nonempty('Bắt buộc'),
  movieItemId: z.string().nonempty('Bắt buộc'),
  webThumbnailUrl: z.string().nonempty('Bắt buộc')
});

export const movieSidebarSearchSchema = z.object({
  active: z.boolean().optional().nullable()
});
