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

export type SubtitleTimeField = 'start' | 'end';

export type SubtitleTimePointSelection = {
  field: SubtitleTimeField;
  seconds: number;
  key: number;
};

export type SubtitleFormStateType =
  | {
      mode: 'create';
    }
  | {
      mode: 'edit';
      subtitleId: string;
    };

type VideoLibrarySubtitleState = {
  currentTime: number; // seconds
  subtitles: SubtitleType[];
  selectedSubtitleId: string | null;
  isSeeking: boolean;
  duration: number; // seconds
  subtitleFormState: SubtitleFormStateType | null;
  pendingSubtitleFormState: SubtitleFormStateType | null;
  isSubtitleFormChanged: boolean;
  isSubtitleFormSwitchConfirmOpen: boolean;
  subtitleTimePickField: SubtitleTimeField | null;
  subtitleTimePointSelection: SubtitleTimePointSelection | null;
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
  requestSubtitleFormState: (subtitleFormState: SubtitleFormStateType) => void;
  closeSubtitleForm: () => void;
  setSubtitleFormChanged: (isSubtitleFormChanged: boolean) => void;
  setSubtitleFormSwitchConfirmOpen: (
    isSubtitleFormSwitchConfirmOpen: boolean
  ) => void;
  confirmSubtitleFormSwitch: () => void;
  startSubtitleTimePick: (field: SubtitleTimeField) => void;
  cancelSubtitleTimePick: () => void;
  selectSubtitleTimePoint: (seconds: number) => void;
};

export type VideoLibrarySubtitleStoreType = VideoLibrarySubtitleState &
  VideoLibrarySubtitleActions;

export type SubtitleBodyType = z.infer<typeof subtitleSchema>;
