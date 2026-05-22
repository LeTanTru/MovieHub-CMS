import type { VideoLibraryStoreType } from '@/types';
import { create } from 'zustand';

export const useVideoLibraryStore = create<VideoLibraryStoreType>((set) => ({
  targetVideoId: null,
  setTargetVideoId: (targetVideoId) => set({ targetVideoId })
}));
