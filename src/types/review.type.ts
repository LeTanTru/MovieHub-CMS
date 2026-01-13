import { reviewSearchSchema } from '@/schemaValidations';
import type { BaseSearchType } from '@/types/search.type';
import { z } from 'zod';

export type ReviewResType = {
  author: {
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
  content: string;
  createdDate: string;
  id: string;
  modifiedDate: string;
  movieId: number;
  rate: number;
  statistics: { averageRating: number; reviewCount: number };
  status: number;
  totalDislike: number;
  totalLike: number;
};

export type ReviewSearchType = z.infer<typeof reviewSearchSchema> &
  BaseSearchType;

export type ChangeReviewStatusBodyType = {
  id: string;
  status: number;
};
