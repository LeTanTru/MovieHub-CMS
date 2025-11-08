import { serverProviderSchema } from '@/schemaValidations';
import z from 'zod';

export type ServerProviderResType = {
  id: string;
  name: string;
  url: string;
  maxTenant: number;
  currentTenantCount: number;
  mySqlRootUser: string;
  mySqlRootPassword: string;
  mySqlJdbcUrl: string;
  driverClassName: string;
};

export type ServerProviderBodyType = z.infer<typeof serverProviderSchema>;
