import type { VideoLibrarySubtitleStoreType } from '@/types';
import { create } from 'zustand';

export const useVideoLibrarySubtitleStore =
  create<VideoLibrarySubtitleStoreType>((set) => ({
    currentTime: 0,
    subtitles: [],

    setCurrentTime: (currentTime) => set({ currentTime }),
    setSubtitles: (subtitles) => set({ subtitles })
  }));
