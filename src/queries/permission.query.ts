import { apiConfig, queryKeys } from '@/constants';
import { logger } from '@/logger';
import type {
  ApiResponse,
  ApiResponseList,
  PermissionBodyType,
  PermissionResType,
  PermissionSearchType
} from '@/types';
import { http, notify } from '@/utils';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export const usePermissionListQuery = (params?: PermissionSearchType) => {
  return useQuery({
    queryKey: [`${queryKeys.PERMISSION}-list`, params],
    queryFn: () =>
      http.get<ApiResponseList<PermissionResType>>(
        apiConfig.permission.getList,
        {
          params
        }
      )
  });
};

// export const usePermissionQuery = (id: string) => {
//   return useQuery({
//     queryKey: ['permission', id],
//     queryFn: () =>
//       http.get<ApiResponse<PermissionResType>>(apiConfig.permission.getById, {
//         pathParams: { id }
//       })
//   });
// };

export const useCreatePermissionMutation = () => {
  return useMutation({
    mutationKey: [`${queryKeys.PERMISSION}-create`],
    mutationFn: (body: Omit<PermissionBodyType, 'id'>) =>
      http.post<ApiResponse<any>>(apiConfig.permission.create, {
        body
      })
  });
};

export const useUpdatePermissionMutation = () => {
  return useMutation({
    mutationKey: [`${queryKeys.PERMISSION}-update`],
    mutationFn: (body: PermissionBodyType) =>
      http.put<ApiResponse<any>>(apiConfig.permission.update, {
        body
      })
  });
};

export const useDeletePermissionMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: [`${queryKeys.PERMISSION}-delete`],
    mutationFn: (id: string) =>
      http.delete<ApiResponse<any>>(apiConfig.permission.delete, {
        pathParams: {
          id
        }
      }),
    onSuccess: async (res) => {
      if (res.result) {
        await queryClient.invalidateQueries({
          queryKey: [`${queryKeys.PERMISSION}-list`]
        });
        notify.success('Xóa quyền thành công');
      } else {
        notify.error('Xóa quyền thất bại');
      }
    },
    onError: (error) => {
      logger.error(`Error while deleting permission: `, error);
      notify.error('Xóa quyền thất bại');
    }
  });
};
