import { apiConfig, queryKeys } from '@/constants';
import type {
  ApiResponseList,
  GroupPermissionResType,
  GroupPermissionSearchType
} from '@/types';
import { http } from '@/utils';
import { useQuery } from '@tanstack/react-query';

export const useGroupPermissionListQuery = (
  params?: GroupPermissionSearchType
) => {
  return useQuery({
    queryKey: [queryKeys.GROUP_PERMISSION_LIST, params],
    queryFn: () =>
      http.get<ApiResponseList<GroupPermissionResType>>(
        apiConfig.groupPermission.getList,
        {
          params
        }
      ),
    select: (data) => data.data
  });
};
