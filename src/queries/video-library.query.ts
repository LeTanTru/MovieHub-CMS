import { apiConfig, queryKeys } from '@/constants';
import {
  ApiResponse,
  ProcessAudioVideoLibraryBodyType,
  RetryProcessVideoLibraryBodyType
} from '@/types';
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

export const useProcessAudioVideoLibraryMutation = () => {
  return useMutation({
    mutationKey: [queryKeys.PROCESS_AUDIO_VIDEO_LIBRARY],
    mutationFn: (body: ProcessAudioVideoLibraryBodyType) =>
      http.put<ApiResponse<any>>(apiConfig.videoLibrary.processAudio, {
        body
      })
  });
};
