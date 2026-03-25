import {
  commentChangeStatusSchema,
  commentPinSchema,
  commentSchema,
  commentSearchSchema,
  commentVoteSchema
} from '@/schemaValidations';
import { ProfileResType } from '@/types/account.type';
import { MovieItemResType } from '@/types/movie-item.type';
import type { BaseSearchType } from '@/types/search.type';
import { z } from 'zod';

export type CommentResType = {
  author: ProfileResType;
  content: string;
  createdDate: string;
  id: string;
  isPinned: boolean;
  modifiedDate: string;
  movieId: string;
  movieItem: MovieItemResType;
  replyTo: ProfileResType;
  status: number;
  totalChildren: number;
  totalDislike: number;
  totalLike: number;
  parent: {
    id: string;
    author: ProfileResType;
  };
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
