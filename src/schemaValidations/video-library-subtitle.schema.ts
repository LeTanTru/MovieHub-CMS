import z from 'zod';

export const videoLibrarySubtitleSearchSchema = z.object({
  videoLibraryId: z.string().nonempty('Bắt buộc'),
  language: z.string().optional().nullable()
});

export const videoLibrarySubtitleTranslateSchema = z.object({
  id: z.string().nonempty('Bắt buộc'),
  label: z.string().nonempty('Bắt buộc'),
  language: z.string().nonempty('Bắt buộc')
});

export const videoLibrarySubtitleSchema = z.object({
  id: z.string().nonempty('Bắt buộc'),
  isDefault: z.boolean().default(false),
  label: z.string().nonempty('Bắt buộc')
});
