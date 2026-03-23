import { apiConfig, queryKeys } from '@/constants';
import { useAuthStore } from '@/store';
import type { ApiResponse, ProfileBodyType, ProfileResType } from '@/types';
import { http } from '@/utils';
import { useMutation, useQuery } from '@tanstack/react-query';

export const useProfileQuery = (enabled: boolean = false) => {
  return useQuery({
    queryKey: [queryKeys.PROFILE],
    queryFn: () =>
      http.get<ApiResponse<ProfileResType>>(apiConfig.account.getProfile),
    enabled: enabled
  });
};

export const useUpdateProfileMutation = () => {
  return useMutation({
    mutationKey: [`update-${queryKeys.PROFILE}`],
    mutationFn: (body: ProfileBodyType) =>
      http.put<ApiResponse<any>>(apiConfig.account.updateProfile, {
        body
      }),
    onSuccess: async (res) => {
      if (res.result) {
        const res = await http.get<ApiResponse<ProfileResType>>(
          apiConfig.account.getProfile
        );
        useAuthStore.getState().setProfile(res.data!);
      }
    }
  });
};
