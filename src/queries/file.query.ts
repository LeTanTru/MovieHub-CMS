import { apiConfig, queryKeys, uploadOptions } from '@/constants';
import type {
  ApiResponse,
  UploadFileResType,
  UploadImageResType,
  UploadVideoResType
} from '@/types';
import { http } from '@/utils';
import { useMutation } from '@tanstack/react-query';
import type { AxiosRequestConfig } from 'axios';

export const useUploadAvatarMutation = () => {
  return useMutation({
    mutationKey: [`upload-avatar-${queryKeys.FILE}`],
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
    mutationKey: [`upload-logo-${queryKeys.FILE}`],
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

export const useUploadVideoMutation = () => {
  return useMutation({
    mutationKey: [`upload-video-${queryKeys.FILE}`],
    mutationFn: ({
      file,
      options
    }: {
      file: Blob;
      options?: AxiosRequestConfig;
    }) =>
      http.post<ApiResponse<UploadVideoResType>>(apiConfig.file.uploadVideo, {
        body: {
          file: file,
          type: uploadOptions.VIDEO
        },
        options
      })
  });
};

export const useUploadFileMutation = () => {
  return useMutation({
    mutationKey: [`upload-${queryKeys.FILE}`],
    mutationFn: ({
      file,
      options
    }: {
      file: Blob;
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
    mutationKey: [`delete-${queryKeys.FILE}`],
    mutationFn: (body: { filePath: string }) =>
      http.post<ApiResponse<any>>(apiConfig.file.delete, {
        body
      })
  });
};
