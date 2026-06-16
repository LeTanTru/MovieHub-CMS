import { reviewSearchSchema } from '@/schemaValidations';
import { ProfileResType } from '@/types/account.type';
import type { BaseSearchType } from '@/types/search.type';
import { z } from 'zod';

export type ReviewResType = {
  author: ProfileResType;
  content: string;
  createdDate: string;
  id: string;
  modifiedDate: string;
  movieId: string;
  rate: number;
  statistics: {
    averageRating: number;
    reviewCount: number;
  };
  status: number;
  totalDislike: number;
  totalLike: number;
  toxicSpans: string | null;
};

export type ReviewSearchType = z.infer<typeof reviewSearchSchema> &
  BaseSearchType;

export type ChangeReviewStatusBodyType = {
  id: string;
  status: number;
};
