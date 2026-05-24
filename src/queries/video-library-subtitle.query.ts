import { apiConfig, queryKeys } from '@/constants';
import {
  ApiResponseNoData,
  VideoLibrarySubtitleTranslateBodyType
} from '@/types';
import { http } from '@/utils';
import { useMutation } from '@tanstack/react-query';

export const useVideoSubtitleTranslateMutation = () => {
  return useMutation({
    mutationKey: [queryKeys.VIDEO_LIBRARY_SUBTITLE_TRANSLATE],
    mutationFn: (body: VideoLibrarySubtitleTranslateBodyType) =>
      http.post<ApiResponseNoData>(apiConfig.videoLibrarySubtitle.translate, {
        body
      })
  });
};
