import type { VideoLibrarySubtitleStoreType } from '@/types';
import { create } from 'zustand';

export const useVideoLibrarySubtitleStore =
  create<VideoLibrarySubtitleStoreType>((set) => ({
    currentTime: 0,
    subtitles: [],
    selectedSubtitleId: null,
    isSeeking: false,

    setCurrentTime: (currentTime) => set({ currentTime }),
    setSubtitles: (subtitles) => set({ subtitles }),
    setSelectedSubtitleId: (selectedSubtitleId) => set({ selectedSubtitleId }),
    updateSubtitle: (id, patch) =>
      set((state) => ({
        subtitles: state.subtitles.map((subtitle) =>
          subtitle.id === id ? { ...subtitle, ...patch } : subtitle
        )
      })),
    setIsSeeking: (isSeeking) => set({ isSeeking })
  }));
