import type { VideoLibraryStoreType } from '@/types';
import { create } from 'zustand';

const useVideoLibraryStore = create<VideoLibraryStoreType>((set) => ({
  targetVideoId: null,
  setTargetVideoId: (targetVideoId) => set({ targetVideoId })
}));

export default useVideoLibraryStore;
