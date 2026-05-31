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

export type SubtitleType = {
  id: string;
  start: string;
  end: string;
  text: string;
  startMs: number;
  endMs: number;
};

type VideoLibrarySubtitleState = {
  currentTime: number;
  subtitles: SubtitleType[];
  durationMs: number;
  selectedSubtitleId?: string;
  past: SubtitleType[][];
  future: SubtitleType[][];
};

type VideoLibrarySubtitleActions = {
  setCurrentTime: (currentTime: number) => void;
  setSubtitles: (
    subtitles: SubtitleType[],
    options?: { resetHistory?: boolean }
  ) => void;
  setDurationMs: (durationMs: number) => void;
  setSelectedSubtitleId: (id?: string) => void;
  updateSubtitle: (id: string, patch: Partial<SubtitleType>) => void;
  commitSubtitles: (previousSubtitles: SubtitleType[]) => void;
  undo: () => void;
  redo: () => void;
};

export type VideoLibrarySubtitleStoreType = VideoLibrarySubtitleState &
  VideoLibrarySubtitleActions;
