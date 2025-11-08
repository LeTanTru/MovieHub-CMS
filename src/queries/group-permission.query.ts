import { apiConfig } from '@/constants';
import { ApiResponse, ApiResponseList } from '@/types';
import {
  GroupPermissionBodyType,
  GroupPermissionResType,
  GroupPermissionSearchType
} from '@/types/group-permission.type';
import { http } from '@/utils';
import { useMutation, useQuery } from '@tanstack/react-query';

export const useGroupPermissionListQuery = (
  params?: GroupPermissionSearchType
) => {
  return useQuery({
    queryKey: ['group-permission-list', params],
    queryFn: () =>
      http.get<ApiResponseList<GroupPermissionResType>>(
        apiConfig.groupPermission.getList,
        {
          params
        }
      )
  });
};

export const useGroupPermissionQuery = (id: string) => {
  return useQuery({
    queryKey: ['permission', id],
    queryFn: () =>
      http.get<ApiResponse<GroupPermissionBodyType>>(
        apiConfig.groupPermission.getById,
        {
          pathParams: { id }
        }
      )
  });
};

export const useCreateGroupPermissionMutation = () => {
  return useMutation({
    mutationKey: ['group-permission-create'],
    mutationFn: (body: Omit<GroupPermissionBodyType, 'id'>) =>
      http.post<ApiResponse<any>>(apiConfig.groupPermission.create, {
        body
      })
  });
};

export const useUpdateGroupPermissionMutation = () => {
  return useMutation({
    mutationKey: ['group-permission-update'],
    mutationFn: (body: GroupPermissionBodyType) =>
      http.put<ApiResponse<any>>(apiConfig.groupPermission.update, {
        body
      })
  });
};

// export const useDeleteGroupPermissionMutation = () => {
//   const queryClient = useQueryClient();
//   return useMutation({
//     mutationKey: ['group-permission-delete'],
//     mutationFn: async (id: string) =>
//       await groupPermissionApiRequest.delete(id),
//     onSuccess: (res) => {
//       if (res.result) {
//         queryClient.invalidateQueries({
//           queryKey: ['group-permission-list']
//         });
//         notify.success('Xóa nhóm quyền thành công');
//       } else {
//         notify.error('Xóa nhóm quyền thất bại');
//       }
//     },
//     onError: (error) => {
//       logger.error(`Error while deleting permission: `, error);
//       notify.error('Xóa nhóm quyền thất bại');
//     }
//   });
// };
