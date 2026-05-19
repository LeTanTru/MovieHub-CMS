import { apiConfig, queryKeys } from '@/constants';
import type {
  ApiResponse,
  UnreadCountNotificationResType,
  UpdateReadNotificationBodyType
} from '@/types';
import { http } from '@/utils';
import { useMutation, useQuery } from '@tanstack/react-query';

export const useCountUnreadNotificationQuery = () => {
  return useQuery({
    queryKey: [queryKeys.UNREAD_NOTIFICATION_COUNT],
    queryFn: ({ signal }) =>
      http.get<ApiResponse<UnreadCountNotificationResType>>(
        apiConfig.notification.countUnread,
        { signal }
      ),
    select: (data) => data.data
  });
};

export const useUpdateReadNotificationMutation = () => {
  return useMutation({
    mutationKey: [queryKeys.UPDATE_READ_NOTIFICATION],
    mutationFn: (body: UpdateReadNotificationBodyType) =>
      http.put<ApiResponse<any>>(apiConfig.notification.updateRead, {
        body
      })
  });
};

export const useReadAllNotificationMutation = () => {
  return useMutation({
    mutationKey: [queryKeys.READ_ALL_NOTIFICATION],
    mutationFn: () => http.put<ApiResponse<any>>(apiConfig.notification.readAll)
  });
};

export const useDeleteAllNotificationMutation = () => {
  return useMutation({
    mutationKey: [queryKeys.DELETE_ALL_NOTIFICATION],
    mutationFn: () =>
      http.delete<ApiResponse<any>>(apiConfig.notification.deleteAll)
  });
};
