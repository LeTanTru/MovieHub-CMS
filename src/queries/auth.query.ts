import envConfig from '@/config';
import { apiConfig, queryKeys } from '@/constants';
import { LoginBodyType, LoginResType } from '@/types';
import { http } from '@/utils';
import { useMutation } from '@tanstack/react-query';

export const useLoginManagerMutation = () => {
  return useMutation({
    mutationKey: [queryKeys.LOGIN],
    mutationFn: (body: LoginBodyType) =>
      http.post<LoginResType>(apiConfig.auth.loginManager, {
        body,
        options: {
          headers: {
            Authorization: `Basic ${btoa(`${envConfig.NEXT_PUBLIC_APP_USERNAME}:${envConfig.NEXT_PUBLIC_APP_PASSWORD}`)}`
          }
        }
      })
  });
};

export const useLoginEmployeeMutation = () => {
  return useMutation({
    mutationKey: [queryKeys.LOGIN],
    mutationFn: (body: LoginBodyType) =>
      http.post<LoginResType>(apiConfig.auth.loginEmployee, {
        body
      })
  });
};
