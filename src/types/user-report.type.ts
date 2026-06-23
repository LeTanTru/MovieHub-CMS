import { userReportSearchSchema } from '@/schemaValidations';
import type { BaseSearchType } from '@/types/search.type';
import { z } from 'zod';

export type UserReportResType = {
  content: string;
  createdDate: string;
  id: string;
  modifiedDate: string;
  objectId: number;
  status: number;
  type: number;
  user: {
    avatarPath: string;
    email: string;
    fullName: string;
    gender: number;
    id: number;
    isVip: boolean;
    kind: number;
    username: string;
  };
};

export type UserReportSearchType = z.infer<typeof userReportSearchSchema> &
  BaseSearchType;
