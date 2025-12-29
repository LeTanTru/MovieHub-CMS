import { apiConfig, MAX_PAGE_SIZE, queryKeys } from '@/constants';
import {
  ApiResponse,
  ApiResponseList,
  MovieItemResType,
  MovieItemSearchType
} from '@/types';
import { http } from '@/utils';
import { useMutation, useQuery } from '@tanstack/react-query';

export const useMovieItemListQuery = ({
  params,
  enabled
}: {
  params: MovieItemSearchType;
  enabled: boolean;
}) => {
  return useQuery({
    queryKey: [`${queryKeys.MOVIE_ITEM}-list-query`],
    queryFn: () =>
      http.get<ApiResponseList<MovieItemResType>>(apiConfig.movieItem.getList, {
        params: {
          ...params,
          size: MAX_PAGE_SIZE
        }
      }),
    enabled
  });
};

export const useUpdateOrderingMovieItemMutation = () => {
  return useMutation({
    mutationKey: [`update-ordering-${queryKeys.MOVIE_ITEM}`],
    mutationFn: (body: { id: string; ordering: number }[]) =>
      http.post<ApiResponse<any>>(apiConfig.movieItem.updateOrdering, {
        body
      })
  });
};
