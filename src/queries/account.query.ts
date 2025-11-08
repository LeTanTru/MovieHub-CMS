import { apiConfig } from '@/constants';
import { useAuthStore } from '@/store';
import { ApiResponse, ProfileBodyType, ProfileResType } from '@/types';
import { http } from '@/utils';
import { useMutation, useQuery } from '@tanstack/react-query';

export const useProfileQuery = (enabled: boolean = false) => {
  return useQuery({
    queryKey: ['profile'],
    queryFn: () =>
      http.get<ApiResponse<ProfileResType>>(apiConfig.account.getProfile),
    enabled: enabled
  });
};

export const useUpdateProfileMutation = () => {
  return useMutation({
    mutationKey: ['update-profile'],
    mutationFn: (body: ProfileBodyType) =>
      http.put<ApiResponse<any>>(apiConfig.account.updateProfileAdmin, {
        body
      }),
    onSuccess: async () => {
      const res = await http.get<ApiResponse<ProfileResType>>(
        apiConfig.account.getProfile
      );
      useAuthStore.getState().setProfile(res.data!);
    }
  });
};
