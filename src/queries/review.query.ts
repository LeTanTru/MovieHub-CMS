import { apiConfig, queryKeys } from '@/constants';
import { ChangeReviewStatusBodyType } from '@/types';
import { http } from '@/utils';
import { useMutation } from '@tanstack/react-query';

export const useChangeReviewStatusMutation = () => {
  return useMutation({
    mutationKey: [`change-status-${queryKeys.COMMENT}`],
    mutationFn: (body: ChangeReviewStatusBodyType) =>
      http.put(apiConfig.review.changeStatus, {
        body
      })
  });
};
