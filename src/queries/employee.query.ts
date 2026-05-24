import { apiConfig, queryKeys } from '@/constants';
import type { ApiResponse, ApiResponseNoData, ProfileResType } from '@/types';
import { http } from '@/utils';
import { useMutation, useQuery } from '@tanstack/react-query';

export const useChangeEmployeeStatusMutation = () => {
  return useMutation({
    mutationKey: [queryKeys.CHANGE_EMPLOYEE_STATUS],
    mutationFn: (body: { id: string; status: number }) =>
      http.put<ApiResponseNoData>(apiConfig.employee.changeStatus, {
        body
      })
  });
};

export const useEmployeeProfileQuery = (enabled: boolean = false) => {
  return useQuery({
    queryKey: [queryKeys.EMPLOYEE_PROFILE],
    queryFn: ({ signal }) =>
      http.get<ApiResponse<ProfileResType>>(apiConfig.employee.getProfile, {
        signal
      }),
    enabled,
    select: (data) => data.data
  });
};
