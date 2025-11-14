import z from 'zod';

export const personSchema = z.object({
  avatarPath: z.string().nonempty('Bắt buộc'),
  bio: z.string().nonempty('Bắt buộc'),
  country: z.string().nonempty('Bắt buộc'),
  dateOfBirth: z.string().nonempty('Bắt buộc'),
  gender: z.number({ error: 'Bắt buộc' }),
  kinds: z.array(z.number()).nonempty('Bắt buộc'),
  name: z.string().nonempty('Bắt buộc'),
  otherName: z.string().nonempty('Bắt buộc')
});

export const personSearchSchema = z.object({
  country: z.string().optional().nullable(),
  gender: z.number().optional().nullable(),
  kind: z.number().optional().nullable(),
  name: z.string().optional().nullable(),
  otherName: z.string().optional().nullable(),
  status: z.number().optional().nullable()
});
