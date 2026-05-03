import { updateReadNotificationSchema } from '@/schemaValidations';
import { BaseSearchType } from '@/types/search.type';
import z from 'zod';

export type UnreadCountNotificationResType = {
  totalUnread: number;
};

export type NotificationResType = {
  body: string;
  cmd: string;
  createdDate: string;
  id: string;
  isRead: boolean;
  modifiedDate: string;
  status: number;
  title: string;
  type: number;
};

export type UpdateReadNotificationBodyType = z.infer<
  typeof updateReadNotificationSchema
>;

export type NotificationSearchType = BaseSearchType;

export type ConvertVideoNotificationType = {
  id: string;
  name: string;
  duration: number;
  state: number;
  thumbnailUrl: string;
};

export type ReplyCommentNotificationType = {
  id: string;
  movieId: string;
  movieTitle: string;
  movieThumbnail: string;
  content: string;
  parentId: string;
  author: {
    id: string;
    username: string;
    email: string;
    fullName: string;
    avatarPath: string;
  };
};

export type VoteCommentNotificationType = {
  id: string;
  movieId: string;
  movieTitle: string;
  movieThumbnail: string;
  content: string;
  reactionType: number;
  author: {
    id: string;
    username: string;
    email: string;
    fullName: string;
    avatarPath: string;
  };
};
