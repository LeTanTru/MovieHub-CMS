import { apiConfig, queryKeys } from '@/constants';
import {
  ApiResponse,
  ApiResponseList,
  MovieDistributionResType,
  MovieDistributionSearchType,
  OverviewResType,
  OverviewSearchType,
  TopMoviesResType,
  TopMoviesSearchType
} from '@/types';
import { http } from '@/utils';
import { useQuery } from '@tanstack/react-query';

export const useMovieDistributionQuery = ({
  params,
  enabled
}: {
  params?: MovieDistributionSearchType;
  enabled?: boolean;
}) => {
  return useQuery({
    queryKey: [queryKeys.MOVIE_DISTRIBUTION_STATISTICS, params],
    queryFn: ({ signal }) =>
      http.get<ApiResponse<MovieDistributionResType[]>>(
        apiConfig.statistics.movieDistribution,
        {
          params,
          signal
        }
      ),
    enabled,
    select: (data) => data.data
  });
};

export const useOverviewQuery = ({
  params,
  enabled
}: {
  params?: OverviewSearchType;
  enabled?: boolean;
}) => {
  return useQuery({
    queryKey: [queryKeys.OVERVIEW_STATISTICS, params],
    queryFn: ({ signal }) =>
      http.get<ApiResponse<OverviewResType>>(apiConfig.statistics.overview, {
        params,
        signal
      }),
    enabled,
    select: (data) => data.data
  });
};

export const useTopMoviesQuery = ({
  params,
  enabled
}: {
  params?: TopMoviesSearchType;
  enabled?: boolean;
}) => {
  return useQuery({
    queryKey: [queryKeys.TOP_MOVIES_STATISTICS, params],
    queryFn: ({ signal }) =>
      http.get<ApiResponseList<TopMoviesResType>>(
        apiConfig.statistics.topMovies,
        {
          params,
          signal
        }
      ),
    enabled,
    select: (data) => data.data
  });
};
