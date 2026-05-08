import { apiConfig, queryKeys, uploadOptions } from '@/constants';
import type {
  ApiResponse,
  UploadFileResType,
  UploadImageResType
} from '@/types';
import { http } from '@/utils';
import { useMutation } from '@tanstack/react-query';
import type { AxiosRequestConfig } from 'axios';

export const useUploadAvatarMutation = () => {
  return useMutation({
    mutationKey: [queryKeys.UPLOAD_AVATAR_FILE],
    mutationFn: ({
      file,
      options
    }: {
      file: Blob;
      options?: AxiosRequestConfig;
    }) =>
      http.post<ApiResponse<UploadImageResType>>(apiConfig.file.upload, {
        body: {
          file: file,
          type: uploadOptions.AVATAR
        },
        options
      })
  });
};

export const useUploadLogoMutation = () => {
  return useMutation({
    mutationKey: [queryKeys.UPLOAD_LOGO_FILE],
    mutationFn: ({
      file,
      options
    }: {
      file: Blob;
      options?: AxiosRequestConfig;
    }) =>
      http.post<ApiResponse<UploadImageResType>>(apiConfig.file.upload, {
        body: {
          file: file,
          type: uploadOptions.LOGO
        },
        options
      })
  });
};

export const useUploadFileMutation = () => {
  return useMutation({
    mutationKey: [queryKeys.UPLOAD_FILE],
    mutationFn: ({
      file,
      options
    }: {
      file: File;
      options?: AxiosRequestConfig;
    }) =>
      http.post<ApiResponse<UploadFileResType>>(apiConfig.file.upload, {
        body: {
          file: file,
          type: uploadOptions.SYSTEM
        },
        options
      })
  });
};

export const useDeleteFileMutation = () => {
  return useMutation({
    mutationKey: [queryKeys.DELETE_FILE],
    mutationFn: ({ filePath }: { filePath: string }) =>
      http.post<ApiResponse<any>>(apiConfig.file.delete, {
        body: {
          filePath: filePath
        }
      })
  });
};
