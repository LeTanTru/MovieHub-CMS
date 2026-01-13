import { apiConfig, queryKeys } from '@/constants';
import type { ApiResponse } from '@/types';
import { http } from '@/utils';
import { useMutation } from '@tanstack/react-query';

export const useGetClientTokenMutation = () => {
  return useMutation({
    mutationKey: [`${queryKeys.SNS_CONFIG}-get-client-token`],
    mutationFn: (body: { appName: string }) =>
      http.post<ApiResponse<{ token: string }>>(apiConfig.sns.getClientToken, {
        body
      })
  });
};

export const useSendSignalMutation = () => {
  return useMutation({
    mutationKey: [`${queryKeys.SNS_CONFIG}-send-signal`],
    mutationFn: (body: { appName: string; payload: string }) =>
      http.post<ApiResponse<{ token: string }>>(apiConfig.sns.getClientToken, {
        body
      })
  });
};
