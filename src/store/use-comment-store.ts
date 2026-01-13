import type { CommentStoreType } from '@/types';
import { create } from 'zustand';

const useCommentStore = create<CommentStoreType>((set) => ({
  replyingComment: null,
  editingComment: null,
  openParentIds: [],

  openReply: (replyingComment) => set({ replyingComment }),
  closeReply: () => set({ replyingComment: null }),

  setEditingComment: (editingComment) => set({ editingComment }),
  setOpenParentIds: (openParentIds) =>
    set((state) => ({
      openParentIds:
        typeof openParentIds === 'function'
          ? openParentIds(state.openParentIds)
          : openParentIds
    }))
}));

export default useCommentStore;
