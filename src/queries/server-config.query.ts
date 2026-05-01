import { apiConfig, queryKeys } from '@/constants';
import {
  ApiResponse,
  ApiResponseList,
  ServerConfigChangeStatusBodyType,
  ServerConfigResType,
  ServerConfigSearchType
} from '@/types';
import { http } from '@/utils';
import { useMutation, useQuery } from '@tanstack/react-query';

export const useServerConfigListQuery = (params?: ServerConfigSearchType) => {
  return useQuery({
    queryKey: [queryKeys.SERVER_CONFIG_LIST],
    queryFn: () =>
      http.get<ApiResponseList<ServerConfigResType>>(
        apiConfig.serverConfig.autoComplete,
        {
          params
        }
      )
  });
};

export const useChangeServerConfigStatusMutation = () => {
  return useMutation({
    mutationKey: [queryKeys.SERVER_CONFIG_CHANGE_STATUS],
    mutationFn: (body: ServerConfigChangeStatusBodyType) =>
      http.post<ApiResponse<any>>(apiConfig.serverConfig.changeStatus, {
        body
      })
  });
};
