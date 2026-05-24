import { apiConfig, queryKeys } from '@/constants';
import {
  ApiResponseList,
  ApiResponseNoData,
  ServerConfigChangeStatusBodyType,
  ServerConfigResType,
  ServerConfigSearchType
} from '@/types';
import { http } from '@/utils';
import { useMutation, useQuery } from '@tanstack/react-query';

export const useServerConfigListQuery = (params?: ServerConfigSearchType) => {
  return useQuery({
    queryKey: [queryKeys.SERVER_CONFIG_LIST],
    queryFn: ({ signal }) =>
      http.get<ApiResponseList<ServerConfigResType>>(
        apiConfig.serverConfig.autoComplete,
        {
          params,
          signal
        }
      ),
    select: (data) => data.data
  });
};

export const useChangeServerConfigStatusMutation = () => {
  return useMutation({
    mutationKey: [queryKeys.SERVER_CONFIG_CHANGE_STATUS],
    mutationFn: (body: ServerConfigChangeStatusBodyType) =>
      http.post<ApiResponseNoData>(apiConfig.serverConfig.changeStatus, {
        body
      })
  });
};
