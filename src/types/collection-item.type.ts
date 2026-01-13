import {
  collectionItemSchema,
  collectionItemSearchSchema
} from '@/schemaValidations';
import type { MovieResType } from '@/types/movie.type';
import type { BaseSearchType } from '@/types/search.type';
import { z } from 'zod';

export type CollectionItemResType = {
  collectionId: number;
  createdDate: string;
  id: string;
  modifiedDate: string;
  movie: MovieResType;
  ordering: number;
  status: number;
};

export type CollectionItemBodyType = z.infer<typeof collectionItemSchema>;

export type CollectionItemSearchType = z.infer<
  typeof collectionItemSearchSchema
> &
  BaseSearchType;
