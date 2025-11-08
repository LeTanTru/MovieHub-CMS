import z from 'zod';

export const serverProviderSchema = z.object({
  driverClassName: z.string().nonempty('Bắt buộc'),
  maxTenant: z.number({ error: 'Bắt buộc' }),
  mySqlJdbcUrl: z.string().nonempty('Bắt buộc'),
  mySqlRootPassword: z.string().nonempty('Bắt buộc'),
  mySqlRootUser: z.string().nonempty('Bắt buộc'),
  name: z.string().nonempty('Bắt buộc'),
  status: z.number({ error: 'Bắt buộc' }),
  url: z.string().nonempty('Bắt buộc'),
  host: z.string().nonempty('Bắt buộc'),
  port: z.number({ error: 'Bắt buộc' })
});
