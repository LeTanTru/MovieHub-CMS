import { CommentStoreType } from '@/types';
import { create } from 'zustand';

const useCommentStore = create<CommentStoreType>((set) => ({
  replyingCommentId: null,
  editingComment: null,
  openParentIds: [],

  openReply: (id) => set({ replyingCommentId: id }),
  closeReply: () => set({ replyingCommentId: null }),

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
