import { apiConfig, queryKeys } from '@/constants';
import {
  ApiResponse,
  ApiResponseList,
  ServerConfigChangeActiveBodyType,
  ServerConfigResType,
  ServerConfigSearchType
} from '@/types';
import { http } from '@/utils';
import { useMutation, useQuery } from '@tanstack/react-query';

export const useServerConfigListQuery = (params?: ServerConfigSearchType) => {
  return useQuery({
    queryKey: [`${queryKeys.SERVER_CONFIG}-list`],
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
    mutationKey: [`${queryKeys.SERVER_CONFIG}-change-status`],
    mutationFn: (body: ServerConfigChangeActiveBodyType) =>
      http.post<ApiResponse<any>>(apiConfig.serverConfig.changeStatus, {
        body
      })
  });
};
