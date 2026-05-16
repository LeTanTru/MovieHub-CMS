import { apiConfig, queryKeys } from '@/constants';
import {
  ApiResponse,
  ProcessAudioVideoLibraryBodyType,
  RetryProcessVideoLibraryBodyType,
  VideoLibraryResType
} from '@/types';
import { http } from '@/utils';
import { useMutation, useQuery } from '@tanstack/react-query';

export const useVideoLibraryQuery = (id: string) => {
  return useQuery({
    queryKey: [queryKeys.VIDEO_LIBRARY, id],
    queryFn: () =>
      http.get<ApiResponse<VideoLibraryResType>>(
        apiConfig.videoLibrary.getById,
        {
          pathParams: {
            id
          }
        }
      ),
    enabled: !!id,
    select: (data) => data.data
  });
};

export const useRetryProcessVideoLibraryMutation = () => {
  return useMutation({
    mutationKey: [queryKeys.RETRY_PROCESS_VIDEO_LIBRARY],
    mutationFn: (body: RetryProcessVideoLibraryBodyType) =>
      http.put<ApiResponse<any>>(apiConfig.videoLibrary.retryProcess, {
        body
      })
  });
};

export const useProcessAudioVideoLibraryMutation = () => {
  return useMutation({
    mutationKey: [queryKeys.PROCESS_AUDIO_VIDEO_LIBRARY],
    mutationFn: (body: ProcessAudioVideoLibraryBodyType) =>
      http.put<ApiResponse<any>>(apiConfig.videoLibrary.processAudio, {
        body
      })
  });
};
