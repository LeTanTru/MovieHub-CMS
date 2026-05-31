import type { VideoLibrarySubtitleStoreType } from '@/types';
import { create } from 'zustand';

const HISTORY_LIMIT = 50;

const hasSameSubtitles = (a: unknown, b: unknown) =>
  JSON.stringify(a) === JSON.stringify(b);

const keepSelectedSubtitle = (
  selectedSubtitleId: string | undefined,
  subtitles: VideoLibrarySubtitleStoreType['subtitles']
) =>
  selectedSubtitleId &&
  subtitles.some((subtitle) => subtitle.id === selectedSubtitleId)
    ? selectedSubtitleId
    : undefined;

export const useVideoLibrarySubtitleStore =
  create<VideoLibrarySubtitleStoreType>((set, get) => ({
    currentTime: 0,
    durationMs: 0,
    subtitles: [],
    selectedSubtitleId: undefined,
    past: [],
    future: [],

    setCurrentTime: (currentTime) => set({ currentTime }),
    setDurationMs: (durationMs) => set({ durationMs }),
    setSubtitles: (subtitles, options) =>
      set(
        options?.resetHistory
          ? {
              subtitles,
              selectedSubtitleId: undefined,
              past: [],
              future: []
            }
          : { subtitles }
      ),
    setSelectedSubtitleId: (selectedSubtitleId) => set({ selectedSubtitleId }),
    updateSubtitle: (id, patch) =>
      set((state) => ({
        subtitles: state.subtitles.map((subtitle) =>
          subtitle.id === id ? { ...subtitle, ...patch } : subtitle
        )
      })),
    commitSubtitles: (previousSubtitles) => {
      const { subtitles, past } = get();

      if (hasSameSubtitles(subtitles, previousSubtitles)) return;

      set({
        past: [...past, previousSubtitles].slice(-HISTORY_LIMIT),
        future: []
      });
    },
    undo: () => {
      const { future, past, selectedSubtitleId, subtitles } = get();
      const previousSubtitles = past[past.length - 1];

      if (!previousSubtitles) return;

      set({
        subtitles: previousSubtitles,
        selectedSubtitleId: keepSelectedSubtitle(
          selectedSubtitleId,
          previousSubtitles
        ),
        past: past.slice(0, -1),
        future: [subtitles, ...future].slice(0, HISTORY_LIMIT)
      });
    },
    redo: () => {
      const { future, past, selectedSubtitleId, subtitles } = get();
      const nextSubtitles = future[0];

      if (!nextSubtitles) return;

      set({
        subtitles: nextSubtitles,
        selectedSubtitleId: keepSelectedSubtitle(
          selectedSubtitleId,
          nextSubtitles
        ),
        past: [...past, subtitles].slice(-HISTORY_LIMIT),
        future: future.slice(1)
      });
    }
  }));
