import type { ReviewStoreType } from '@/types';
import { create } from 'zustand';

export const useReviewStore = create<ReviewStoreType>((set) => ({
  targetReviewId: null,

  setScrollTarget: (target) =>
    set({
      targetReviewId: target.reviewId ?? null
    }),

  clearScrollTarget: () => set({ targetReviewId: null })
}));
