import { audienceSearchSchema } from '@/schemaValidations';
import type { BaseSearchType } from '@/types/search.type';
import { z } from 'zod';

export type AudienceResType = {
  avatarPath: string;
  createdDate: string;
  email: string;
  fullName: string;
  gender: number;
  group: {
    createdDate: string;
    description: string;
    id: string;
    isSystemRole: boolean;
    kind: number;
    modifiedDate: string;
    name: string;
    permissions: {
      createdDate: string;
      id: string;
      modifiedDate: string;
      permissionCode: string;
      status: number;
    }[];
    status: number;
  };
  id: string;
  kind: number;
  modifiedDate: string;
  phone: string;
  status: number;
  username: string;
};

export type AudienceSearchType = z.infer<typeof audienceSearchSchema> &
  BaseSearchType;
