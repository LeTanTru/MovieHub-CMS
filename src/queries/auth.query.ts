import envConfig from '@/config';
import { apiConfig } from '@/constants';
import { LoginBodyType, LoginResType } from '@/types';
import { http } from '@/utils';
import { useMutation } from '@tanstack/react-query';

export const useLoginMutation = () => {
  return useMutation({
    mutationKey: ['login'],
    mutationFn: (body: LoginBodyType) =>
      http.post<LoginResType>(apiConfig.auth.login, {
        body,
        options: {
          headers: {
            Authorization: `Basic ${btoa(`${envConfig.NEXT_PUBLIC_APP_USERNAME}:${envConfig.NEXT_PUBLIC_APP_PASSWORD}`)}`
          }
        }
      })
  });
};
