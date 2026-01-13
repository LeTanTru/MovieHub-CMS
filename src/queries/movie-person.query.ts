import { apiConfig, queryKeys } from '@/constants';
import type { ApiResponse, MoviePersonBodyType } from '@/types';
import { http } from '@/utils';
import { useMutation } from '@tanstack/react-query';

export const useUpdateMoviePersonMutation = () => {
  return useMutation({
    mutationKey: [`update-${queryKeys.MOVIE_PERSON}`],
    mutationFn: (
      body: Omit<MoviePersonBodyType, 'movieId' | 'ordering' | 'personId'>
    ) =>
      http.put<ApiResponse<any>>(apiConfig.moviePerson.update, {
        body
      })
  });
};

export const useCreateMoviePersonMutation = () => {
  return useMutation({
    mutationKey: [`create-${queryKeys.MOVIE_PERSON}`],
    mutationFn: (body: MoviePersonBodyType) =>
      http.put<ApiResponse<any>>(apiConfig.moviePerson.create, {
        body
      })
  });
};
