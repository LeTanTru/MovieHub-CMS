import {
  videoLibrarySchema,
  videoLibrarySearchSchema
} from '@/schemaValidations';
import { BaseSearchType } from '@/types/search.type';
import { z } from 'zod';

export type VideoLibraryResType = {
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
  relativeContentPath: string;
  sourceType: number;
  spriteUrl: string;
  state: number;
  status: number;
  thumbnailUrl: string;
  vttUrl: string;
};

export type VideoLibraryBodyType = z.infer<typeof videoLibrarySchema>;

export type VideoLibrarySearchType = z.infer<typeof videoLibrarySearchSchema> &
  BaseSearchType;

type VideoLibraryStoreState = {
  targetVideoId: string | null;
};

type VideoLibraryStoreActions = {
  setTargetVideoId: (id: string | null) => void;
};

export type VideoLibraryStoreType = VideoLibraryStoreState &
  VideoLibraryStoreActions;
