import type { SubtitleBodyType, VideoLibrarySubtitleStoreType } from '@/types';
import { createSubtitleId } from '@/utils/text.util';
import { secondsToTime, timeToSeconds } from '@/utils/time.util';
import { create } from 'zustand';

const sortSubtitles = <T extends { startTime: number; endTime: number }>(
  subtitles: T[]
) =>
  subtitles.toSorted(
    (a, b) => a.startTime - b.startTime || a.endTime - b.endTime
  );

export const useVideoLibrarySubtitleStore =
  create<VideoLibrarySubtitleStoreType>((set) => ({
    currentTime: 0,
    subtitles: [],
    selectedSubtitleId: null,
    isSeeking: false,
    duration: 0,
    subtitleFormState: null,
    pendingSubtitleFormState: null,
    isSubtitleFormChanged: false,
    isSubtitleFormSwitchConfirmOpen: false,

    setCurrentTime: (currentTime) => set({ currentTime }),
    setSubtitles: (subtitles) => set({ subtitles }),
    setSelectedSubtitleId: (selectedSubtitleId) => set({ selectedSubtitleId }),
    addSubtitle: ({ start, end, text }: SubtitleBodyType) =>
      set((state) => {
        const startTime = timeToSeconds(start);
        const endTime = timeToSeconds(end);
        const subtitle = {
          id: createSubtitleId(state.subtitles.length, startTime, endTime),
          start: secondsToTime(startTime),
          end: secondsToTime(endTime),
          text,
          startTime,
          endTime
        };

        return {
          subtitles: sortSubtitles([...state.subtitles, subtitle])
        };
      }),
    updateSubtitle: (id, patch) =>
      set((state) => ({
        subtitles: sortSubtitles(
          state.subtitles.map((subtitle) =>
            subtitle.id === id ? { ...subtitle, ...patch } : subtitle
          )
        )
      })),
    deleteSubtitle: (id: string) =>
      set((state) => {
        const subtitles = state.subtitles.filter(
          (subtitle) => subtitle.id !== id
        );

        return {
          subtitles,
          selectedSubtitleId:
            state.selectedSubtitleId === id ? null : state.selectedSubtitleId
        };
      }),
    startSeek: () =>
      set((state) => (state.isSeeking ? state : { isSeeking: true })),
    completeSeek: (currentTime) => set({ currentTime, isSeeking: false }),
    setDuration: (duration: number) => set({ duration }),
    requestSubtitleFormState: (subtitleFormState) =>
      set((state) => {
        if (state.subtitleFormState && state.isSubtitleFormChanged) {
          return {
            pendingSubtitleFormState: subtitleFormState,
            isSubtitleFormSwitchConfirmOpen: true
          };
        }

        return {
          subtitleFormState,
          isSubtitleFormChanged: false
        };
      }),
    closeSubtitleForm: () =>
      set({
        subtitleFormState: null,
        isSubtitleFormChanged: false
      }),
    setSubtitleFormChanged: (isSubtitleFormChanged) =>
      set({ isSubtitleFormChanged }),
    setSubtitleFormSwitchConfirmOpen: (isSubtitleFormSwitchConfirmOpen) =>
      set((state) => ({
        isSubtitleFormSwitchConfirmOpen,
        pendingSubtitleFormState: isSubtitleFormSwitchConfirmOpen
          ? state.pendingSubtitleFormState
          : null
      })),
    confirmSubtitleFormSwitch: () =>
      set((state) => ({
        subtitleFormState: state.pendingSubtitleFormState,
        isSubtitleFormChanged: false,
        pendingSubtitleFormState: null
      }))
  }));
