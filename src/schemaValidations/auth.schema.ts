import z from 'zod';

export const loginSchema = z.object({
  username: z.string().nonempty('Bắt buộc'),
  password: z.string().nonempty('Bắt buộc'),
  grant_type: z.string().nonempty('Bắt buộc'),
  tenantId: z.string().nonempty('Bắt buộc'),
  loginType: z.number({ error: 'Bắt buộc' })
});
