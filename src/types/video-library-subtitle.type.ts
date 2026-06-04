import {
  subtitleSchema,
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
  start: string; // HH:mm:ss display time
  end: string; // HH:mm:ss display time
  text: string;
  startTime: number; // seconds
  endTime: number; // seconds
};

type VideoLibrarySubtitleState = {
  currentTime: number; // seconds
  subtitles: SubtitleType[];
  selectedSubtitleId: string | null;
  isSeeking: boolean;
  duration: number; // seconds
};

type VideoLibrarySubtitleActions = {
  setCurrentTime: (currentTime: number) => void;
  setSubtitles: (subtitles: SubtitleType[]) => void;
  setSelectedSubtitleId: (id: string | null) => void;
  addSubtitle: (subtitle: SubtitleBodyType) => void;
  updateSubtitle: (id: string, patch: Partial<SubtitleType>) => void;
  deleteSubtitle: (id: string) => void;
  startSeek: () => void;
  completeSeek: (currentTime: number) => void;
  setDuration: (duration: number) => void;
};

export type VideoLibrarySubtitleStoreType = VideoLibrarySubtitleState &
  VideoLibrarySubtitleActions;

export type SubtitleBodyType = z.infer<typeof subtitleSchema>;
