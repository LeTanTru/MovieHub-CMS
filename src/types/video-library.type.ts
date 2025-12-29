import {
  videoLibrarySchema,
  videoLibrarySearchSchema
} from '@/schemaValidations';
import { BaseSearchType } from '@/types/search.type';
import z from 'zod';

export type VideoLibraryResType = {
  content: string;
  createdDate: string;
  description: string;
  duration: number;
  id: string;
  introEnd: number;
  introStart: number;
  modifiedDate: string;
  name: string;
  outroStart: number;
  relativeContentPath: string;
  spriteUrl: string;
  state: number;
  status: number;
  thumbnailUrl: string;
  vttUrl: string;
  sourceType: number;
};

export type VideoLibraryBodyType = z.infer<typeof videoLibrarySchema>;

export type VideoLibrarySearchType = z.infer<typeof videoLibrarySearchSchema> &
  BaseSearchType;
