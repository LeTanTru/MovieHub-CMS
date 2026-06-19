import { apiConfig, queryKeys } from '@/constants';
import {
  ApiResponseNoData,
  type ChangeReviewStatusBodyType,
  type ReviewToxicSpansBodyType
} from '@/types';
import { http } from '@/utils';
import { useMutation } from '@tanstack/react-query';

export const useChangeReviewStatusMutation = () => {
  return useMutation({
    mutationKey: [queryKeys.CHANGE_REVIEW_STATUS],
    mutationFn: (body: ChangeReviewStatusBodyType) =>
      http.put<ApiResponseNoData>(apiConfig.review.changeStatus, {
        body
      })
  });
};

export const useUpdateReviewToxicSpansMutation = () => {
  return useMutation({
    mutationKey: [queryKeys.UPDATE_REVIEW_TOXIC_SPANS],
    mutationFn: (body: ReviewToxicSpansBodyType) =>
      http.put<ApiResponseNoData>(apiConfig.review.updateToxicSpans, {
        body
      })
  });
};
