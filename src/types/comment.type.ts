import {
  commentChangeStatusSchema,
  commentPinSchema,
  commentSchema,
  commentSearchSchema,
  commentVoteSchema
} from '@/schemaValidations';
import type { BaseSearchType } from '@/types/search.type';
import { z } from 'zod';

export type CommentResType = {
  id: string;
  status: number;
  modifiedDate: string;
  createdDate: string;
  movieId: string;
  content: string;
  totalLike: number;
  totalDislike: number;
  totalChildren: number;
  isPinned: boolean;
  parent: {
    id: string;
    authorInfo: string;
  };
  authorInfo: string;
  replyToInfo: string;
};

export type AuthorInfoType = {
  id: string;
  email: string;
  fullName: string;
  kind: number;
  avatarPath: string;
  gender: number;
};

export type CommentBodyType = z.infer<typeof commentSchema>;

export type CommentSearchType = z.infer<typeof commentSearchSchema> &
  BaseSearchType;

export type CommentPinBodyType = z.infer<typeof commentPinSchema>;

export type CommentVoteBodyType = z.infer<typeof commentVoteSchema>;

export type ChangeCommentStatusBodyType = z.infer<
  typeof commentChangeStatusSchema
>;

export type CommentVoteResType = {
  id: string;
  type: number;
};

type CommentStoreState = {
  replyingComment: CommentResType | null;
  editingComment: CommentResType | null;
  openParentIds: string[];
};

type CommentStoreActions = {
  openReply: (replyingComment: CommentResType | null) => void;
  closeReply: () => void;

  setEditingComment: (c: CommentResType | null) => void;
  setOpenParentIds: (ids: string[] | ((prev: string[]) => string[])) => void;
};

export type CommentStoreType = CommentStoreState & CommentStoreActions;
