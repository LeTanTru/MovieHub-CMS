import { apiConfig, queryKeys } from '@/constants';
import type { ApiResponse, LoginBodyType, LoginResType } from '@/types';
import { http } from '@/utils';
import { useMutation } from '@tanstack/react-query';

export const useLoginMutation = () => {
  return useMutation({
    mutationKey: [queryKeys.LOGIN],
    mutationFn: (body: LoginBodyType) =>
      http.post<ApiResponse<LoginResType>>(apiConfig.api.auth.login, { body })
  });
};

export const useLogoutMutation = () => {
  return useMutation({
    mutationKey: [queryKeys.LOGOUT],
    mutationFn: () => http.post<ApiResponse<any>>(apiConfig.auth.logout)
  });
};
