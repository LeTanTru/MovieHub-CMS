import { apiConfig, uploadOptions } from '@/constants';
import {
  ApiResponse,
  UploadImageResponseType,
  UploadVideoResponseType
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
      http.post<ApiResponse<UploadImageResponseType>>(apiConfig.file.upload, {
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
      http.post<ApiResponse<UploadImageResponseType>>(apiConfig.file.upload, {
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
      http.post<ApiResponse<UploadVideoResponseType>>(
        apiConfig.file.uploadVideo,
        {
          body: {
            file: file,
            type: uploadOptions.UPLOAD_VIDEO
          },
          options
        }
      )
  });
};
