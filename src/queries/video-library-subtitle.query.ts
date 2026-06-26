import { apiConfig, queryKeys } from '@/constants';
import {
  ApiResponseNoData,
  VideoLibrarySubtitleTranslateBodyType
} from '@/types';
import { http } from '@/utils';
import { useMutation, useQuery } from '@tanstack/react-query';

export const useVideoSubtitleTranslateMutation = () => {
  return useMutation({
    mutationKey: [queryKeys.VIDEO_LIBRARY_SUBTITLE_TRANSLATE],
    mutationFn: (body: VideoLibrarySubtitleTranslateBodyType) =>
      http.post<ApiResponseNoData>(apiConfig.videoLibrarySubtitle.translate, {
        body
      })
  });
};

export const useVideoSubtitleContentQuery = (vttUrl: string) => {
  return useQuery({
    queryKey: [queryKeys.VIDEO_LIBRARY_SUBTITLE_CONTENT, vttUrl],
    queryFn: async ({ signal }) => {
      const res = await fetch(vttUrl, { cache: 'no-store', signal });
      if (!res.ok) {
        throw new Error(`Failed to fetch VTT content: ${res.status}`);
      }
      const content = await res.text();
      return content;
    },
    staleTime: Number.POSITIVE_INFINITY,
    enabled: !!vttUrl
  });
};
