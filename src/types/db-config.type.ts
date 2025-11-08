import { dbConfigSchema } from '@/schemaValidations';
import { ServerProviderResType } from '@/types/server-provider.type';
import z from 'zod';

export type DbConfigBodyType = z.infer<typeof dbConfigSchema>;

export type DbConfigResType = {
  id: string;
  name: string;
  url: string;
  driverClassName: string;
  initialize: boolean;
  maxConnection: number;
  serverProvider: ServerProviderResType;
};
