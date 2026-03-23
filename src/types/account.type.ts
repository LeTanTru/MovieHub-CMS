import {
  accountSchema,
  accountSearchSchema,
  profileSchema
} from '@/schemaValidations';
import { BaseSearchType } from '@/types/search.type';
import { z } from 'zod';

export type ProfileResType = {
  id: string;
  kind: number;
  username: string;
  email: string;
  fullName: string;
  group: {
    id: string;
    status: number;
    modifiedDate: string;
    createdDate: string;
    name: string;
    description: string;
    kind: number;
    subKind: number;
    permissions: {
      id: string;
      name: string;
      action: string;
      showMenu: boolean;
      groupPermission: {
        id: string;
        name: string;
        ordering: number;
      };
      permissionCode: string;
    }[];
    isSystemRole: boolean;
  };
  isSuperAdmin: boolean;
  avatarPath: string;
};

export type ProfileBodyType = z.infer<typeof profileSchema>;

export type AccountSearchType = z.infer<typeof accountSearchSchema> &
  BaseSearchType;

export type AccountAutoResType = {
  id: string;
  status: number;
  kind: number;
  username: string;
  phone: string;
  email: string;
  fullName: string;
  group: {
    id: string;
    name: string;
    kind: number;
    subKind: number;
  };
  lastLogin: string;
  avatarPath: string;
  isSuperAdmin: boolean;
};

export type AccountResType = {
  createdBy: string;
  createdDate: string;
  modifiedBy: string;
  modifiedDate: string;
  status: number;
  id: string;
  kind: number;
  username: string;
  email: string;
  fullName: string;
  group: {
    id: string;
    name: string;
    kind: number;
    subKind: number;
  };
  lastLogin: string;
  avatarPath: string;
  resetPwdCode: string;
  resetPwdTime: string;
  attemptCode: number;
  isSuperAdmin: boolean;
  phone: string;
};

export type AccountBodyType = z.infer<ReturnType<typeof accountSchema>>;
