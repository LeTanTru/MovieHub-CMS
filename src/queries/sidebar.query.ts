import { apiConfig, queryKeys } from '@/constants';
import { ApiResponse, MovieSidebarChangeActiveBodyType } from '@/types';
import { http } from '@/utils';
import { useMutation } from '@tanstack/react-query';

export const useChangeActiveSidebarMutation = () => {
  return useMutation({
    mutationKey: [queryKeys.SIDEBAR],
    mutationFn: (body: MovieSidebarChangeActiveBodyType) =>
      http.post<ApiResponse<any>>(apiConfig.sidebar.changeActive, {
        body
      })
  });
};
