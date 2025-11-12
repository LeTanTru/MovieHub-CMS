import { apiConfig, queryKeys } from '@/constants';
import { useAuthStore } from '@/store';
import { ApiResponse, CustomerBodyType, CustomerResType } from '@/types';
import { http } from '@/utils';
import { useMutation, useQuery } from '@tanstack/react-query';

export const useManagerProfileQuery = (enabled: boolean = false) => {
  return useQuery({
    queryKey: [`manager-${queryKeys.PROFILE}`],
    queryFn: () =>
      http.get<ApiResponse<CustomerResType>>(apiConfig.customer.getProfile),
    enabled: enabled
  });
};

export const useManagerUpdateProfileMutation = () => {
  return useMutation({
    mutationKey: [`update-${queryKeys.PROFILE}-manager`],
    mutationFn: (body: CustomerBodyType) =>
      http.put<ApiResponse<any>>(apiConfig.customer.updateProfile, {
        body
      }),
    onSuccess: async () => {
      const res = await http.get<ApiResponse<CustomerResType>>(
        apiConfig.customer.getProfile
      );
      useAuthStore.getState().setProfile(res.data!);
    }
  });
};

export const useEmployeeProfileQuery = (enabled: boolean = false) => {
  return useQuery({
    queryKey: [`employee-${queryKeys.PROFILE}`],
    queryFn: () =>
      http.get<ApiResponse<CustomerResType>>(apiConfig.employee.getProfile),
    enabled: enabled
  });
};

export const useEmployeeUpdateProfileMutation = () => {
  return useMutation({
    mutationKey: [`update-${queryKeys.PROFILE}-manager`],
    mutationFn: (body: CustomerBodyType) =>
      http.put<ApiResponse<any>>(apiConfig.employee.updateProfile, {
        body
      }),
    onSuccess: async () => {
      const res = await http.get<ApiResponse<CustomerResType>>(
        apiConfig.employee.getProfile
      );
      useAuthStore.getState().setProfile(res.data!);
    }
  });
};
