import type { CommentStoreType } from '@/types';
import { create } from 'zustand';

export const useCommentStore = create<CommentStoreType>((set) => ({
  replyingComment: null,
  editingComment: null,
  openParentIds: [],
  targetCommentId: null,
  targetParentId: null,

  openReply: (replyingComment) => set({ replyingComment }),

  closeReply: () => set({ replyingComment: null }),

  setEditingComment: (editingComment) => set({ editingComment }),

  setOpenParentIds: (openParentIds) =>
    set((state) => ({
      openParentIds:
        typeof openParentIds === 'function'
          ? openParentIds(state.openParentIds)
          : openParentIds
    })),

  setScrollTarget: (target) =>
    set({
      targetCommentId: target.commentId ?? null,
      targetParentId: target.parentId ?? null
    }),

  clearScrollTarget: () => set({ targetCommentId: null, targetParentId: null })
}));
