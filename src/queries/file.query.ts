import { apiConfig, queryKeys, uploadOptions } from '@/constants';
import { logger } from '@/logger';
import type {
  ApiResponse,
  UploadFileResType,
  UploadImageResType,
  UploadVideoResType
} from '@/types';
import { http, notify } from '@/utils';
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
      }),
    onSuccess: (res) => {
      if (res.result) {
        notify.success('Tải lên ảnh đại diện thành công');
      } else {
        notify.error('Tải lên ảnh đại diện thất bại');
      }
    },
    onError: (error) => {
      logger.error('[UPLOAD_AVATAR_ERROR]', error);
      notify.error('Tải lên ảnh đại diện thất bại');
    }
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
      }),
    onSuccess: (res) => {
      if (res.result) {
        notify.success('Tải lên logo thành công');
      } else {
        notify.error('Tải lên logo thất bại');
      }
    },
    onError: (error) => {
      logger.error('[UPLOAD_LOGO_ERROR]', error);
      notify.error('Tải lên logo thất bại');
    }
  });
};

export const useUploadVideoMutation = () => {
  return useMutation({
    mutationKey: [queryKeys.UPLOAD_VIDEO_FILE],
    mutationFn: ({
      file,
      options
    }: {
      file: File;
      options?: AxiosRequestConfig;
    }) =>
      http.post<ApiResponse<UploadVideoResType>>(apiConfig.file.uploadVideo, {
        body: {
          file: file,
          type: uploadOptions.VIDEO
        },
        options
      }),
    onSuccess: (res) => {
      if (res.result) {
        notify.success('Tải lên video thành công');
      } else {
        notify.error('Tải lên video thất bại');
      }
    },
    onError: (error) => {
      logger.error('[UPLOAD_VIDEO_ERROR]', error);
      notify.error('Tải lên video thất bại');
    }
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
      }),
    onSuccess: (res) => {
      if (res.result) {
        notify.success('Tải lên file thành công');
      } else {
        notify.error('Tải lên file thất bại');
      }
    },
    onError: (error) => {
      logger.error('[UPLOAD_FILE_ERROR]', error);
      notify.error('Tải lên file thất bại');
    }
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
