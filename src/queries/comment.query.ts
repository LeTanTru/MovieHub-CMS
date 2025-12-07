import { apiConfig, queryKeys } from '@/constants';
import {
  ApiResponse,
  ApiResponseList,
  ChangeCommentStatusBodyType,
  CommentPinBodyType,
  CommentResType,
  CommentSearchType,
  CommentVoteBodyType,
  CommentVoteResType
} from '@/types';
import { http } from '@/utils';
import { useMutation, useQuery } from '@tanstack/react-query';

export const useVoteListCommentQuery = ({ movieId }: { movieId: string }) => {
  return useQuery({
    queryKey: [`vote-${queryKeys.COMMENT}`, movieId],
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

export const useCommentListQuery = (
  params?: CommentSearchType,
  enabled: boolean = false
) => {
  return useQuery({
    queryKey: [`${queryKeys.COMMENT}-list`, params],
    queryFn: () =>
      http.get<ApiResponseList<CommentResType>>(apiConfig.comment.getList, {
        params
      }),
    enabled
  });
};

export const useChangeCommenStatusMutation = () => {
  return useMutation({
    mutationKey: [`change-status-${queryKeys.COMMENT}`],
    mutationFn: (body: ChangeCommentStatusBodyType) =>
      http.put(apiConfig.comment.changeStatus, {
        body
      })
  });
};
