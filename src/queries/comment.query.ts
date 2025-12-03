import { apiConfig, queryKeys } from '@/constants';
import { CommentPinBodyType, CommentVoteBodyType } from '@/types';
import { http } from '@/utils';
import { useMutation } from '@tanstack/react-query';

export const useVoteCommentMutation = () => {
  return useMutation({
    mutationKey: [`vote-${queryKeys.COMMENT}`],
    mutationFn: (body: CommentVoteBodyType) =>
      http.put(apiConfig.comment.vote, {
        body
      })
  });
};

export const usePinCommentMutation = () => {
  return useMutation({
    mutationKey: [`pin-${queryKeys.COMMENT}`],
    mutationFn: (body: CommentPinBodyType) =>
      http.put(apiConfig.comment.pin, {
        body
      })
  });
};
