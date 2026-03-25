import { apiConfig, queryKeys } from '@/constants';
import { ApiResponse } from '@/types';
import { http } from '@/utils';
import { useMutation } from '@tanstack/react-query';

export const useMarkLatestMovieItemMutation = () => {
  return useMutation({
    mutationKey: [`mark-latest-${queryKeys.MOVIE_ITEM}`],
    mutationFn: (id: string) =>
      http.put<ApiResponse<any>>(apiConfig.movieItem.markLatest, {
        pathParams: { id }
      })
  });
};
