import { collectionSchema, collectionSearchSchema } from '@/schemaValidations';
import type { CollectionItemResType } from '@/types/collection-item.type';
import type { MovieResType } from '@/types/movie.type';
import type { BaseSearchType } from '@/types/search.type';
import type { StyleResType } from '@/types/style.type';
import { z } from 'zod';

export type CollectionResType = {
  collectionItems: CollectionItemResType[];
  color: string;
  createdDate: string;
  filter: string;
  id: string;
  modifiedDate: string;
  movies: MovieResType[];
  name: string;
  ordering: number;
  randomData: boolean;
  status: number;
  style: StyleResType;
  styleType: number;
  type: number;
  fillData: boolean;
};

export type CollectionBodyType = z.infer<typeof collectionSchema>;

export type CollectionSearchType = z.infer<typeof collectionSearchSchema> &
  BaseSearchType;
