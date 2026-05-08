import { apiConfig, queryKeys } from '@/constants';
import { ApiResponse, RetryProcessVideoLibraryBodyType } from '@/types';
import { http } from '@/utils';
import { useMutation } from '@tanstack/react-query';

export const useRetryProcessVideoLibraryMutation = () => {
  return useMutation({
    mutationKey: [queryKeys.RETRY_PROCESS_VIDEO_LIBRARY],
    mutationFn: (body: RetryProcessVideoLibraryBodyType) =>
      http.put<ApiResponse<any>>(apiConfig.videoLibrary.retryProcess, {
        body
      })
  });
};
