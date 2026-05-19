import { apiConfig, queryKeys } from '@/constants';
import type {
  ApiResponse,
  LoginBodyType,
  LoginResType,
  SessionResType
} from '@/types';
import { http } from '@/utils';
import { useMutation, useQuery } from '@tanstack/react-query';

export const useSession = () => {
  return useQuery({
    queryKey: [queryKeys.SESSION],
    queryFn: ({ signal }) =>
      http.get<ApiResponse<SessionResType | null>>(apiConfig.api.auth.session, {
        signal
      }),
    select: (data) => data.data,
    refetchOnMount: 'always',
    gcTime: 0
  });
};

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
    mutationFn: () => http.post<ApiResponse<any>>(apiConfig.api.auth.logout)
  });
};
