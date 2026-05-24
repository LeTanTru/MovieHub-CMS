import {
  processAudioVideoLibrarySchema,
  retryProcessVideoLibrarySchema,
  videoLibrarySchema,
  videoLibrarySearchSchema
} from '@/schemaValidations';
import { BaseSearchType } from '@/types/search.type';
import { z } from 'zod';

export type VideoLibraryResType = {
  audioState: number;
  audioUrl: string;
  content: string;
  createdDate: string;
  description: string;
  duration: number;
  hostname: string;
  id: string;
  introEnd: number;
  introStart: number;
  modifiedDate: string;
  name: string;
  outroStart: number;
  reason: string;
  relativeContentPath: string;
  sourceType: number;
  spriteUrl: string;
  state: number;
  status: number;
  thumbnailUrl: string;
  vttUrl: string;
};

export type VideoLibraryBodyType = z.infer<typeof videoLibrarySchema>;

export type RetryProcessVideoLibraryBodyType = z.infer<
  typeof retryProcessVideoLibrarySchema
>;

export type ProcessAudioVideoLibraryBodyType = z.infer<
  typeof processAudioVideoLibrarySchema
>;

export type VideoLibrarySearchType = z.infer<typeof videoLibrarySearchSchema> &
  BaseSearchType;
