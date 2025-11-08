import { apiConfig, queryKeys } from '@/constants';
import { ApiResponse } from '@/types';
import { http } from '@/utils';
import { useQuery } from '@tanstack/react-query';

export const useSnsConfigQuery = (id: string) => {
  return useQuery({
    queryKey: [`${queryKeys.SNS_CONFIG}`],
    queryFn: () =>
      http.get<ApiResponse<any>>(apiConfig.business.configSns, {
        pathParams: { id }
      }),
    enabled: false
  });
};
