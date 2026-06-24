import {
  commentChangeStatusSchema,
  commentPinSchema,
  commentSchema,
  commentSearchSchema,
  commentToxicSpansSchema,
  commentVoteSchema
} from '@/schema-validations';
import { ProfileResType } from '@/types/account.type';
import { MovieItemResType } from '@/types/movie-item.type';
import type { BaseSearchType } from '@/types/search.type';
import { z } from 'zod';

export type ToxicSpan = {
  start: number;
  end: number;
};

export type CommentResType = {
  author: ProfileResType;
  content: string;
  createdDate: string;
  id: string;
  isPinned: boolean;
  toxicSpans: string | null;
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

export type CommentToxicSpansBodyType = z.infer<typeof commentToxicSpansSchema>;

export type ToxicSpanPreview = ToxicSpan & {
  text: string;
};

export type ToxicSpanSegment = {
  start: number;
  end: number;
  text: string;
  toxic: boolean;
};

type CommentStoreState = {
  replyingComment: CommentResType | null;
  editingComment: CommentResType | null;
  openParentIds: string[];
  targetCommentId: string | null;
  targetParentId: string | null;
};

type CommentStoreActions = {
  openReply: (replyingComment: CommentResType | null) => void;

  closeReply: () => void;

  setEditingComment: (c: CommentResType | null) => void;

  setOpenParentIds: (ids: string[] | ((prev: string[]) => string[])) => void;

  setScrollTarget: (target: {
    commentId?: string | null;
    parentId?: string | null;
  }) => void;

  clearScrollTarget: () => void;
};

export type CommentStoreType = CommentStoreState & CommentStoreActions;
