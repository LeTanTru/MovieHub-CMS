import { userSearchSchema } from '@/schema-validations';
import type { BaseSearchType } from '@/types/search.type';
import { z } from 'zod';

export type UserResType = {
  avatarPath: string;
  createdDate: string;
  email: string;
  fullName: string;
  gender: number;
  group: {
    color: string;
    createdDate: string;
    description: string;
    id: string;
    isSystemRole: boolean;
    kind: number;
    modifiedDate: string;
    name: string;
    permissions: {
      action: string;
      createdDate: string;
      description: string;
      groupPermission: {
        createdDate: string;
        id: string;
        modifiedDate: string;
        name: string;
        ordering: number;
        status: number;
      };
      id: string;
      modifiedDate: string;
      name: string;
      permissionCode: string;
      showMenu: boolean;
      status: number;
    }[];
    status: number;
  };
  id: string;
  isMakeSurvey: boolean;
  kind: number;
  modifiedDate: string;
  phone: string;
  settings: string;
  status: number;
  username: string;
};

export type UserSearchType = z.infer<typeof userSearchSchema> & BaseSearchType;
