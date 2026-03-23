import { apiConfig, queryKeys } from '@/constants';
import type { ApiResponse } from '@/types';
import { http } from '@/utils';
import { useMutation } from '@tanstack/react-query';

export const useChangeUserStatusMutation = () => {
  return useMutation({
    mutationKey: [`change-${queryKeys.USER}-status`],
    mutationFn: (body: { id: string; status: number }) =>
      http.put<ApiResponse<any>>(apiConfig.user.changeStatus, {
        body
      })
  });
};
