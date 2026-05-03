import { apiConfig, queryKeys } from '@/constants';
import { ApiResponse, type ChangeReviewStatusBodyType } from '@/types';
import { http } from '@/utils';
import { useMutation } from '@tanstack/react-query';

export const useChangeReviewStatusMutation = () => {
  return useMutation({
    mutationKey: [queryKeys.CHANGE_REVIEW_STATUS],
    mutationFn: (body: ChangeReviewStatusBodyType) =>
      http.put<ApiResponse<any>>(apiConfig.review.changeStatus, {
        body
      })
  });
};
