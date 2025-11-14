import { permissionSchema } from '@/schemaValidations';
import { BaseSearchType } from '@/types/search.type';
import z from 'zod';

export type PermissionResType = {
  id: string;
  status: number;
  modifiedDate: string;
  createdDate: string;
  name: string;
  action: string;
  showMenu: boolean;
  description: string;
  groupPermission: { id: string; name: string };
  permissionCode: string;
};

export type PermissionBodyType = z.infer<typeof permissionSchema>;

export type PermissionSearchType = BaseSearchType;

export type PermissionAutoResType = {
  id: string;
  name: string;
  pCode: string;
};
