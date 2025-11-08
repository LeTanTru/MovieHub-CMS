import { groupSchema, groupSearchSchema } from '@/schemaValidations';
import { PermissionAutoResType } from '@/types/permission.type';
import { BaseSearchType } from '@/types/search.type';
import z from 'zod';

export type GroupResType = {
  id: string;
  name: string;
  description: string;
  kind: number;
  isSystemRole: boolean;
  permissions: PermissionAutoResType[];
  createdDate: Date;
  modifiedDate: Date;
  status: number;
};

export type GroupBodyType = z.infer<typeof groupSchema>;

export type GroupSearchType = z.infer<typeof groupSearchSchema> &
  BaseSearchType;
