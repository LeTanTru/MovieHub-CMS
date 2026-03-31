import { apiConfig, queryKeys } from '@/constants';
import type { ApiResponse, ProfileResType } from '@/types';
import { http } from '@/utils';
import { useMutation, useQuery } from '@tanstack/react-query';

export const useChangeEmployeeStatusMutation = () => {
  return useMutation({
    mutationKey: [`change-${queryKeys.EMPLOYEE}-status`],
    mutationFn: (body: { id: string; status: number }) =>
      http.put<ApiResponse<any>>(apiConfig.employee.changeStatus, {
        body
      })
  });
};

export const useEmployeeProfileQuery = (enabled: boolean = false) => {
  return useQuery({
    queryKey: [`${queryKeys.EMPLOYEE}-profile`],
    queryFn: () =>
      http.get<ApiResponse<ProfileResType>>(apiConfig.employee.getProfile),
    enabled
  });
};
