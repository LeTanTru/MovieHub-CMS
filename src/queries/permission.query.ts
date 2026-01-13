import { apiConfig } from '@/constants';
import type {
  ApiResponseList,
  PermissionResType,
  PermissionSearchType
} from '@/types';
import { http } from '@/utils';
import { useQuery } from '@tanstack/react-query';

export const usePermissionListQuery = (params?: PermissionSearchType) => {
  return useQuery({
    queryKey: ['permission-list', params],
    queryFn: () =>
      http.get<ApiResponseList<PermissionResType>>(
        apiConfig.permission.getList,
        {
          params
        }
      )
  });
};
