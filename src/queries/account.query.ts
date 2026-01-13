import { apiConfig, queryKeys } from '@/constants';
import { useAuthStore } from '@/store';
import type { ApiResponse, ProfileBodyType, ProfileResType } from '@/types';
import { http } from '@/utils';
import { useMutation, useQuery } from '@tanstack/react-query';

export const useManageProfileQuery = (enabled: boolean = false) => {
  return useQuery({
    queryKey: [`manage-${queryKeys.PROFILE}`],
    queryFn: () =>
      http.get<ApiResponse<ProfileResType>>(apiConfig.customer.getProfile),
    enabled: enabled
  });
};

export const useManagerUpdateProfileMutation = () => {
  return useMutation({
    mutationKey: [`update-${queryKeys.PROFILE}-manager`],
    mutationFn: (body: ProfileBodyType) =>
      http.put<ApiResponse<any>>(apiConfig.customer.updateProfile, {
        body
      }),
    onSuccess: async (res) => {
      if (res.result) {
        const res = await http.get<ApiResponse<ProfileResType>>(
          apiConfig.customer.getProfile
        );
        useAuthStore.getState().setProfile(res.data!);
      }
    }
  });
};

export const useEmployeeProfileQuery = (enabled: boolean = false) => {
  return useQuery({
    queryKey: [`employee-${queryKeys.PROFILE}`],
    queryFn: () =>
      http.get<ApiResponse<ProfileResType>>(apiConfig.employee.getProfile),
    enabled: enabled
  });
};

export const useEmployeeUpdateProfileMutation = () => {
  return useMutation({
    mutationKey: [`update-${queryKeys.PROFILE}-manager`],
    mutationFn: (body: ProfileBodyType) =>
      http.put<ApiResponse<any>>(apiConfig.employee.updateProfile, {
        body
      }),
    onSuccess: async () => {
      const res = await http.get<ApiResponse<ProfileResType>>(
        apiConfig.employee.getProfile
      );
      useAuthStore.getState().setProfile(res.data!);
    }
  });
};
