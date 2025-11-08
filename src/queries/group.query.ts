import { apiConfig } from '@/constants';
import {
  ApiResponse,
  ApiResponseList,
  GroupBodyType,
  GroupResType,
  GroupSearchType
} from '@/types';
import { http } from '@/utils';
import { keepPreviousData, useMutation, useQuery } from '@tanstack/react-query';

export const useGroupListQuery = (params?: GroupSearchType) => {
  return useQuery({
    queryKey: ['group-list', params],
    queryFn: () =>
      http.get<ApiResponseList<GroupResType>>(apiConfig.group.getList, {
        params
      }),
    placeholderData: keepPreviousData
  });
};

export const useGroupQuery = (id: string) => {
  return useQuery({
    queryKey: ['group', id],
    queryFn: () =>
      http.get<ApiResponse<GroupResType>>(apiConfig.group.getById, {
        pathParams: { id }
      }),
    enabled: !!id && id !== 'create'
  });
};

export const useCreateGroupMutation = () => {
  return useMutation({
    mutationKey: ['group-create'],
    mutationFn: (body: Omit<GroupBodyType, 'id'>) =>
      http.post<ApiResponse<any>>(apiConfig.group.create, {
        body
      })
  });
};

export const useUpdateGroupMutation = () => {
  return useMutation({
    mutationKey: ['group-update'],
    mutationFn: (body: GroupBodyType) =>
      http.put<ApiResponse<any>>(apiConfig.group.update, {
        body
      })
  });
};

// export const useDeleteGroupMutation = () => {
//   const queryClient = useQueryClient();
//   return useMutation({
//     mutationKey: ['group-delete'],
//     mutationFn: async (id: string) => await groupApiRequest.delete(id),
//     onSuccess: (res) => {
//       if (res.result) {
//         queryClient.invalidateQueries({ queryKey: ['group-list'] });
//         notify.success('Xóa nhóm thành công');
//       } else {
//         const errCode = res.code;
//         if (errCode === ErrorCode.GROUP_ERROR_IN_USED) {
//           notify.error('Nhóm này đang được sử dụng, không thể xóa');
//         } else {
//           notify.error('Xóa nhóm thất bại');
//         }
//       }
//     },
//     onError: (error) => {
//       logger.error(`Error while deleting group: `, error);
//       notify.error('Xóa nhóm thất bại');
//     }
//   });
// };
