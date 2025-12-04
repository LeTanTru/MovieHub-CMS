import { CommentStoreType } from '@/types';
import { create } from 'zustand';

const useCommentStore = create<CommentStoreType>((set) => ({
  replyingCommentId: null,
  editingComment: null,

  openReply: (id) => set({ replyingCommentId: id }),
  closeReply: () => set({ replyingCommentId: null }),

  setEditingComment: (editingComment) => set({ editingComment })
}));

export default useCommentStore;
