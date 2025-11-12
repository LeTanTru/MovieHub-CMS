import { apiConfig, queryKeys } from '@/constants';
import { ApiResponse } from '@/types';
import { http } from '@/utils';
import { useMutation } from '@tanstack/react-query';

export const useChangeEmployeeStatusMutation = () => {
  return useMutation({
    mutationKey: [`change-${queryKeys.EMPLOYEE}-status`],
    mutationFn: (body: { id: string; status: number }) =>
      http.put<ApiResponse<any>>(apiConfig.employee.changeStatus, {
        body
      })
  });
};
