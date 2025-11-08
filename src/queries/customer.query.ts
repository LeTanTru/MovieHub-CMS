import { apiConfig, queryKeys } from '@/constants';
import {
  ApiResponse,
  ChangeStatusCustomerBodyType,
  CustomerResType
} from '@/types';
import { http } from '@/utils';
import { useMutation, useQuery } from '@tanstack/react-query';

export const useChangeStatusCustomerMutation = () => {
  return useMutation({
    mutationKey: [`change-status-${queryKeys.CUSTOMER}`],
    mutationFn: (body: ChangeStatusCustomerBodyType) =>
      http.put<ApiResponse<any>>(apiConfig.customer.changeStatus, {
        body
      })
  });
};

export const useCustomerQuery = (id: string) => {
  return useQuery({
    queryKey: [`${queryKeys.CUSTOMER}`, id],
    queryFn: () =>
      http.get<ApiResponse<CustomerResType>>(apiConfig.customer.getById, {
        pathParams: { id }
      }),
    enabled: !!id
  });
};
