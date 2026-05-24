import { apiConfig, queryKeys } from '@/constants';
import {
  ApiResponse,
  ApiResponseNoData,
  ProcessAudioVideoLibraryBodyType,
  RetryProcessVideoLibraryBodyType,
  VideoLibraryResType
} from '@/types';
import { http } from '@/utils';
import { useMutation, useQuery } from '@tanstack/react-query';

export const useVideoLibraryQuery = (id: string) => {
  return useQuery({
    queryKey: [queryKeys.VIDEO_LIBRARY, id],
    queryFn: ({ signal }) =>
      http.get<ApiResponse<VideoLibraryResType>>(
        apiConfig.videoLibrary.getById,
        {
          pathParams: {
            id
          },
          signal
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
      http.put<ApiResponseNoData>(apiConfig.videoLibrary.retryProcess, {
        body
      })
  });
};

export const useProcessAudioVideoLibraryMutation = () => {
  return useMutation({
    mutationKey: [queryKeys.PROCESS_AUDIO_VIDEO_LIBRARY],
    mutationFn: (body: ProcessAudioVideoLibraryBodyType) =>
      http.put<ApiResponseNoData>(apiConfig.videoLibrary.processAudio, {
        body
      })
  });
};
