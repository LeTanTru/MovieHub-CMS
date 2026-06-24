import { z } from 'zod';

export const personSchema = z.object({
  avatarPath: z.string().optional().nullable(),
  bio: z.string().optional().nullable(),
  country: z.string().optional().nullable(),
  dateOfBirth: z.string().optional().nullable(),
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
