import {
  serverConfigSchema,
  serverConfigSearchSchema
} from '@/schemaValidations';
import { BaseSearchType } from '@/types/search.type';
import z from 'zod';

export type ServerConfigResType = {
  createdDate: string;
  hostname: string;
  id: string;
  ip: string;
  modifiedDate: string;
  name: string;
  port: number;
  serverNumber: number;
  status: number;
};

export type ServerConfigBodyType = z.infer<typeof serverConfigSchema>;

export type ServerConfigSearchType = z.infer<typeof serverConfigSearchSchema> &
  BaseSearchType;

export type ServerConfigChangeActiveBodyType = {
  id: string;
  active: boolean;
};
