import { apiConfig, queryKeys } from '@/constants';
import type {
  ApiResponse,
  ChangeCommentStatusBodyType,
  CommentPinBodyType,
  CommentVoteBodyType,
  CommentVoteResType
} from '@/types';
import { http } from '@/utils';
import { useMutation, useQuery } from '@tanstack/react-query';

export const useVoteListCommentQuery = ({ movieId }: { movieId: string }) => {
  return useQuery({
    queryKey: [queryKeys.VOTE_COMMENT, movieId],
    queryFn: () =>
      http.get<ApiResponse<CommentVoteResType[]>>(apiConfig.comment.voteList, {
        pathParams: {
          movieId
        }
      }),
    enabled: !!movieId
  });
};

export const useVoteCommentMutation = () => {
  return useMutation({
    mutationKey: [queryKeys.VOTE_COMMENT],
    mutationFn: (body: CommentVoteBodyType) =>
      http.put<ApiResponse<any>>(apiConfig.comment.vote, {
        body
      })
  });
};

export const usePinCommentMutation = () => {
  return useMutation({
    mutationKey: [queryKeys.PIN_COMMENT],
    mutationFn: (body: CommentPinBodyType) =>
      http.put<ApiResponse<any>>(apiConfig.comment.pin, {
        body
      })
  });
};

export const useChangeCommenStatusMutation = () => {
  return useMutation({
    mutationKey: [queryKeys.CHANGE_COMMENT_STATUS],
    mutationFn: (body: ChangeCommentStatusBodyType) =>
      http.put<ApiResponse<any>>(apiConfig.comment.changeStatus, {
        body
      })
  });
};
