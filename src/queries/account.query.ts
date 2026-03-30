import { apiConfig, queryKeys } from '@/constants';
import type { ApiResponse, ProfileResType } from '@/types';
import { http } from '@/utils';
import { useQuery } from '@tanstack/react-query';

export const useProfileQuery = (enabled: boolean = false) => {
  return useQuery({
    queryKey: [queryKeys.PROFILE],
    queryFn: () =>
      http.get<ApiResponse<ProfileResType>>(apiConfig.account.getProfile),
    enabled: enabled
  });
};
