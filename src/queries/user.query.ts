import { apiConfig, queryKeys } from '@/constants';
import type { ApiResponseNoData } from '@/types';
import { http } from '@/utils';
import { useMutation } from '@tanstack/react-query';

export const useChangeUserStatusMutation = () => {
  return useMutation({
    mutationKey: [queryKeys.CHANGE_USER_STATUS],
    mutationFn: (body: { id: string; status: number }) =>
      http.put<ApiResponseNoData>(apiConfig.user.changeStatus, {
        body
      })
  });
};
