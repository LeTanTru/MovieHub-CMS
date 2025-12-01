import {
  commentPinSchema,
  commentSchema,
  commentSearchSchema,
  commentVoteSchema
} from '@/schemaValidations';
import { CategoryResType } from '@/types/category.type';
import { BaseSearchType } from '@/types/search.type';
import z from 'zod';

export type CommentResType = {
  author: { avatarPath: string; fullName: string; id: string; kind: number };
  content: string;
  createdDate: string;
  id: string;
  isPinned: boolean;
  modifiedDate: string;
  movieId: number;
  movieItem: {
    createdDate: string;
    description: string;
    episodes: any[];
    id: string;
    kind: number;
    label: string;
    modifiedDate: string;
    movie: {
      ageRating: number;
      categories: CategoryResType[];
      country: string;
      createdDate: string;
      description: string;
      id: string;
      isFeatured: boolean;
      language: string;
      modifiedDate: string;
      originalTitle: string;
      posterUrl: string;
      releaseDate: string;
      seasons: any[];
      slug: string;
      status: number;
      thumbnailUrl: string;
      title: string;
      type: number;
      viewCount: number;
    };
    ordering: number;
    releaseDate: string;
    status: number;
    thumbnailUrl: string;
    title: string;
    video: {
      content: string;
      createdDate: string;
      description: string;
      duration: number;
      id: string;
      introEnd: number;
      introStart: number;
      modifiedDate: string;
      name: string;
      outroStart: number;
      relativeContentPath: string;
      shortDescription: string;
      sourceType: number;
      spriteUrl: string;
      state: number;
      status: number;
      thumbnailUrl: string;
      vttUrl: string;
    };
  };
  status: number;
  totalChildren: number;
  totalDislike: number;
  totalLike: number;
  parent: CommentResType;
};

export type CommentBodyType = z.infer<typeof commentSchema>;

export type CommentSearchBodyType = z.infer<typeof commentSearchSchema> &
  BaseSearchType;

export type CommentPinBodyType = z.infer<typeof commentPinSchema>;

export type CommentVoteBodyType = z.infer<typeof commentVoteSchema>;
