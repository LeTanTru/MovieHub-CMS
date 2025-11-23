import z from 'zod';

export const appVersionSchema = z.object({
  changeLog: z.string().nonempty('Bắt buộc'),
  code: z.number({ error: 'Bắt buộc' }),
  filePath: z.string().nonempty('Bắt buộc'),
  forceUpdate: z.boolean(),
  isLatest: z.boolean(),
  name: z.string().nonempty('Bắt buộc')
});

export const appVersionSearchSchema = z.object({
  code: z.string().optional().nullable(),
  forceUpdate: z.boolean().optional().nullable(),
  isLatest: z.boolean().optional().nullable(),
  name: z.string().optional().nullable()
});
