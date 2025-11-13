import { categorySchema, categorySearchSchema } from '@/schemaValidations';
import { BaseSearchType } from '@/types/search.type';
import z from 'zod';

export type CategoryResType = {
  id: string;
  status: number;
  modifiedDate: string;
  createdDate: string;
  name: string;
  slug: string;
};

export type CategoryBodyType = z.infer<typeof categorySchema>;

export type CategorySearchType = z.infer<typeof categorySearchSchema> &
  BaseSearchType;
