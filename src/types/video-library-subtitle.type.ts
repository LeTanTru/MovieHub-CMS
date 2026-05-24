import {
  videoLibrarySubtitleSchema,
  videoLibrarySubtitleSearchSchema,
  videoLibrarySubtitleTranslateSchema
} from '@/schemaValidations';
import { BaseSearchType } from '@/types/search.type';
import z from 'zod';

export type VideoLibrarySubtitleResType = {
  createdDate: string;
  fileUrl: string;
  id: string;
  isDefault: boolean;
  label: string;
  language: string;
  modifiedDate: string;
  state: number;
  status: number;
  videoLibraryId: number;
};

export type VideoLibrarySubtitleSearchType = z.infer<
  typeof videoLibrarySubtitleSearchSchema
> &
  BaseSearchType;

export type VideoLibrarySubtitleTranslateBodyType = z.infer<
  typeof videoLibrarySubtitleTranslateSchema
>;

export type VideoLibrarySubtitleBodyType = z.infer<
  typeof videoLibrarySubtitleSchema
>;
