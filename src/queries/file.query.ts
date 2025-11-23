import { apiConfig, uploadOptions } from '@/constants';
import {
  ApiResponse,
  UploadFileResType,
  UploadImageResType,
  UploadVideoResType
} from '@/types';
import { http } from '@/utils';
import { useMutation } from '@tanstack/react-query';
import { AxiosRequestConfig } from 'axios';

export const useUploadAvatarMutation = () => {
  return useMutation({
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
