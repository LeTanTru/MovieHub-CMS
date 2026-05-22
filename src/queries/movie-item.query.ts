import { apiConfig, queryKeys } from '@/constants';
import { ApiResponseNoData } from '@/types';
import { http } from '@/utils';
import { useMutation } from '@tanstack/react-query';

export const useMarkLatestMovieItemMutation = () => {
  return useMutation({
    mutationKey: [queryKeys.MARK_LATEST_MOVIE_ITEM],
    mutationFn: (id: string) =>
      http.put<ApiResponseNoData>(apiConfig.movieItem.markLatest, {
        pathParams: { id }
      })
  });
};
