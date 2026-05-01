import { getQueryClient } from '@/components/providers/query-provider';
import { apiConfig, queryKeys } from '@/constants';
import { logger } from '@/logger';
import type {
  ApiResponse,
  ApiResponseList,
  PermissionResType,
  PermissionSearchType
} from '@/types';
import { http, notify } from '@/utils';
import { useMutation, useQuery } from '@tanstack/react-query';

export const usePermissionListQuery = (params?: PermissionSearchType) => {
  return useQuery({
    queryKey: [queryKeys.PERMISSION_LIST, params],
    queryFn: () =>
      http.get<ApiResponseList<PermissionResType>>(
        apiConfig.permission.getList,
        {
          params
        }
      )
  });
};

export const useDeletePermissionMutation = () => {
  const queryClient = getQueryClient();
  return useMutation({
    mutationKey: [queryKeys.PERMISSION_DELETE],
    mutationFn: (id: string) =>
      http.delete<ApiResponse<any>>(apiConfig.permission.delete, {
        pathParams: {
          id
        }
      }),
    onSuccess: async (res) => {
      if (res.result) {
        await queryClient.invalidateQueries({
          queryKey: [queryKeys.PERMISSION_LIST]
        });
        notify.success('Xóa quyền thành công');
      } else {
        notify.error('Xóa quyền thất bại');
      }
    },
    onError: (error) => {
      logger.error('[DELETE_PERMISSION_ERROR]', error);
      notify.error('Xóa quyền thất bại');
    }
  });
};
