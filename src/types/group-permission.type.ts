import { groupPermissionSchema } from '@/schemaValidations';
import { BaseSearchType } from '@/types/search.type';
import z from 'zod';

export type GroupPermissionResType = {
  id: string;
  name: string;
  createdDate: Date;
  modifiedDate: Date;
  status: number;
};

export type GroupPermissionAutoResType = {
  id: string;
  name: string;
};

export type GroupPermissionSearchType = BaseSearchType;

export type GroupPermissionBodyType = z.infer<typeof groupPermissionSchema>;
