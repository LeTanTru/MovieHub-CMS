import z from 'zod';

export const commentSchema = z.object({
  content: z.string().optional().nullable(),
  movieId: z.string().optional().nullable(),
  movieItemId: z.string().optional().nullable(),
  parentId: z.string().optional().nullable()
});

export const commentSearchSchema = z.object({
  authorId: z.string().optional().nullable(),
  isParent: z.boolean().optional().nullable(),
  isPinned: z.boolean().optional().nullable(),
  movieId: z.string().optional().nullable(),
  movieItemId: z.string().optional().nullable(),
  parentId: z.string().optional().nullable()
});

export const commentPinSchema = z.object({
  id: z.string().nonempty('Bắt buộc'),
  isPinned: z.boolean()
});

export const commentVoteSchema = z.object({
  id: z.string().nonempty('Bắt buộc'),
  type: z.number({ error: 'Bắt buộc' })
});
