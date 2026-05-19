import { apiConfig, queryKeys } from '@/constants';
import type {
  ApiResponse,
  ApiResponseList,
  PermissionResType,
  PermissionSearchType
} from '@/types';
import { http } from '@/utils';
import { useMutation, useQuery } from '@tanstack/react-query';

export const usePermissionListQuery = (params?: PermissionSearchType) => {
  return useQuery({
    queryKey: [queryKeys.PERMISSION_LIST, params],
    queryFn: ({ signal }) =>
      http.get<ApiResponseList<PermissionResType>>(
        apiConfig.permission.getList,
        {
          params,
          signal
        }
      ),
    select: (data) => data.data
  });
};

export const useDeletePermissionMutation = () => {
  return useMutation({
    mutationKey: [queryKeys.PERMISSION_DELETE],
    mutationFn: (id: string) =>
      http.delete<ApiResponse<any>>(apiConfig.permission.delete, {
        pathParams: {
          id
        }
      })
  });
};
