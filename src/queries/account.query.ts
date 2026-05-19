import { apiConfig, queryKeys } from '@/constants';
import type { ApiResponse, ProfileResType } from '@/types';
import { http } from '@/utils';
import { useMutation, useQuery } from '@tanstack/react-query';

export const useProfileQuery = (enabled: boolean = false) => {
  return useQuery({
    queryKey: [queryKeys.PROFILE],
    queryFn: ({ signal }) =>
      http.get<ApiResponse<ProfileResType>>(apiConfig.account.getProfile, {
        signal
      }),
    enabled: enabled,
    select: (data) => data.data
  });
};

export const useChangeAccountStatusMutation = () => {
  return useMutation({
    mutationKey: [queryKeys.CHANGE_ADMIN_STATUS],
    mutationFn: (body: { id: string; status: number }) =>
      http.put<ApiResponse<any>>(apiConfig.account.changeStatus, { body })
  });
};
