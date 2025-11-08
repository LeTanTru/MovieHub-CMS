import {
  accountSchema,
  accountSearchSchema,
  updateProfileSchema
} from '@/schemaValidations/account.schema';
import { BaseSearchType } from '@/types/search.type';
import z from 'zod';

export type Group = {
  id: string;
  name: string;
  kind: number;
  subKind: number;
};

type GroupPermission = {
  createdBy: string;
  createdDate: string;
  modifiedBy: string;
  modifiedDate: string;
  status: number;
  id: string;
  name: string;
};

type Permission = {
  createdBy: string;
  createdDate: string;
  modifiedBy: string;
  modifiedDate: string;
  status: number;
  id: string;
  name: string;
  action: string;
  showMenu: boolean;
  description: string;
  groupPermission: GroupPermission;
  permissionCode?: string;
};

type GroupProfile = {
  id: string;
  status: number;
  modifiedDate: string;
  createdDate: string;
  name: string;
  description: string;
  kind: number;
  subKind: number;
  permissions: Permission[];
  isSystemRole: boolean;
};

export type ProfileResType = {
  id: string;
  kind: number;
  username: string;
  email: string;
  fullName: string;
  group: GroupProfile;
  lastLogin: string;
  isSuperAdmin: boolean;
  avatarPath: string;
  phone: string;
};

export type ProfileBodyType = z.infer<typeof updateProfileSchema>;

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
  group: Group;
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
  group: Group;
  lastLogin: string;
  avatarPath: string;
  resetPwdCode: string;
  resetPwdTime: string;
  attemptCode: number;
  isSuperAdmin: boolean;
  phone: string;
};

export type AccountBodyType = z.infer<ReturnType<typeof accountSchema>>;
