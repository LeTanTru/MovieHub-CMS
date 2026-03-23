import envConfig from '@/config';
import { apiConfig, storageKeys } from '@/constants';
import { logger } from '@/logger';
import { route } from '@/routes';
import type {
  ApiConfig,
  ApiResponse,
  Payload,
  RefreshTokenResType
} from '@/types';
import {
  getAccessTokenFromLocalStorage,
  getData,
  getRefreshTokenFromLocalStorage,
  setAccessTokenToLocalStorage,
  setRefreshTokenToLocalStorage,
  getAccessTokenFromCookie,
  getRefreshTokenFromCookie,
  setAccessTokenToCookie,
  setRefreshTokenToCookie,
  removeAccessTokenFromLocalStorage,
  removeRefreshTokenFromLocalStorage,
  removeAccessTokenFromCookie,
  removeRefreshTokenFromCookie,
  removeData,
  removeCookieData
} from '@/utils';
import axios, {
  AxiosError,
  HttpStatusCode,
  type InternalAxiosRequestConfig,
  type AxiosRequestConfig,
  type AxiosResponse
} from 'axios';
import { redirect } from 'next/navigation';

const isClient = () => typeof window !== 'undefined';
const axiosInstance = axios.create();
// const TIME_OUT = 10000;

type RequestConfigWithRetry = InternalAxiosRequestConfig & {
  _retry?: boolean;
};

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: any) => void;
  reject: (error?: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  logger.info(failedQueue);
  failedQueue = [];
};

const refreshToken = async () => {
  let token: string | null = null;
  if (isClient()) {
    token = getRefreshTokenFromLocalStorage();
  } else {
    token = await getRefreshTokenFromCookie();
  }
  const res: ApiResponse<RefreshTokenResType> = await axios.post(
    apiConfig.auth.refreshToken.baseUrl,
    {
      refresh_token: token,
      grant_type: envConfig.NEXT_PUBLIC_GRANT_TYPE_REFRESH_TOKEN
    },
    {
      headers: {
        Authorization: `Basic ${btoa(`${envConfig.NEXT_PUBLIC_APP_USERNAME}:${envConfig.NEXT_PUBLIC_APP_PASSWORD}`)}`
      }
    }
  );
  const data = res.data;
  if (data) {
    const newAccessToken = data.access_token;
    const newRefreshToken = data.refresh_token;
    if (isClient()) {
      if (newAccessToken) setAccessTokenToLocalStorage(newAccessToken);
      if (newRefreshToken) setRefreshTokenToLocalStorage(newRefreshToken);
    } else {
      if (newAccessToken) await setAccessTokenToCookie(newAccessToken);
      if (newRefreshToken) await setRefreshTokenToCookie(newRefreshToken);
    }
  }
  return res.data?.access_token;
};

axiosInstance.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const originalConfig = error.config as RequestConfigWithRetry;
    if (
      error.response &&
      error.status === HttpStatusCode.Unauthorized &&
      !originalConfig._retry
    ) {
      originalConfig._retry = true;

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalConfig.headers) {
              originalConfig.headers['Authorization'] = `Bearer ${token}`;
            }
            return axiosInstance.request(originalConfig);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      isRefreshing = true;

      try {
        const newAccessToken = await refreshToken();

        if (originalConfig.headers && newAccessToken) {
          originalConfig.headers['Authorization'] = `Bearer ${newAccessToken}`;
        }

        processQueue(null, newAccessToken);
        isRefreshing = false;

        return axiosInstance.request(originalConfig);
      } catch (error) {
        logger.error('Error while refreshing token', error);
        if (
          error instanceof AxiosError &&
          error?.response?.status === HttpStatusCode.BadRequest &&
          error?.response?.data?.message &&
          error?.response?.data?.message?.includes('Invalid refresh token')
        ) {
          if (isClient()) {
            removeAccessTokenFromLocalStorage();
            removeRefreshTokenFromLocalStorage();
            removeData(storageKeys.USER_KIND);
            window.location.href = route.login.path;
          } else {
            await removeAccessTokenFromCookie();
            await removeRefreshTokenFromCookie();
            await removeCookieData(storageKeys.USER_KIND);
            redirect(route.login.path);
          }
        }
        processQueue(error, null);
        isRefreshing = false;
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);

export const sendRequest = async <T>(
  apiConfig: ApiConfig,
  payload: Payload = {}
): Promise<T> => {
  let {
    baseUrl,
    headers,
    method,
    ignoreAuth,
    isRequiredXClientType,
    isUpload
  } = apiConfig;

  const {
    params = {},
    pathParams = {},
    body = {},
    options = {},
    authorization
  } = payload;

  let accessToken: string | null = '';
  let clientType: string | null | undefined = '';

  if (!ignoreAuth) {
    if (isClient()) {
      accessToken = getAccessTokenFromLocalStorage();
    } else {
      accessToken = await getAccessTokenFromCookie();
    }
  }

  if (isRequiredXClientType) {
    if (isClient()) {
      clientType =
        getData(storageKeys.X_CLIENT_TYPE) || envConfig.NEXT_PUBLIC_CLIENT_TYPE;
    } else {
      clientType = envConfig.NEXT_PUBLIC_CLIENT_TYPE;
    }
  }

  const baseHeader: Record<string, string> = { ...headers };

  if (!ignoreAuth && accessToken) {
    baseHeader['Authorization'] = `Bearer ${accessToken}`;
  }

  if (authorization) {
    baseHeader['Authorization'] = authorization;
  }

  if (clientType) {
    baseHeader[storageKeys.X_CLIENT_TYPE] = clientType;
  }

  Object.entries(pathParams).forEach(([key, value]) => {
    baseUrl = baseUrl.replace(`:${key}`, value.toString());
  });

  try {
    const axiosConfig: AxiosRequestConfig = {
      url: baseUrl,
      method,
      headers: baseHeader,
      params,
      // timeout: TIME_OUT,
      ...options
    };

    if (isUpload) {
      const formData = new FormData();

      Object.keys(body).forEach((key) => {
        const value = body[key];

        if (value instanceof Blob) {
          let filename = 'upload';

          if (value instanceof File && value.name) {
            filename = value.name;
          } else {
            const ext = value.type.split('/').pop() || 'bin';
            filename = `upload.${ext}`;
          }

          formData.append(key, value, filename);
        } else {
          formData.append(key, value);
        }
      });

      axiosConfig.data = formData;

      delete axiosConfig.headers!['Content-Type'];
    } else if (method !== 'GET') {
      axiosConfig.data = body;
      axiosConfig.headers = {
        ...axiosConfig.headers,
        'Content-Type': baseHeader['Content-Type'] || 'application/json'
      };
    }

    const res: AxiosResponse = await axiosInstance.request<T>(axiosConfig);
    return res.data;
  } catch (error: any) {
    const err = error as AxiosError;
    throw err;
  }
};

export const http = {
  get<T>(apiConfig: ApiConfig, payload?: Payload) {
    return sendRequest<T>(apiConfig, payload);
  },
  post<T>(apiConfig: ApiConfig, payload?: Payload) {
    return sendRequest<T>(apiConfig, payload);
  },
  put<T>(apiConfig: ApiConfig, payload?: Payload) {
    return sendRequest<T>(apiConfig, payload);
  },
  patch<T>(apiConfig: ApiConfig, payload?: Payload) {
    return sendRequest<T>(apiConfig, payload);
  },
  delete<T>(apiConfig: ApiConfig, payload?: Payload) {
    return sendRequest<T>(apiConfig, payload);
  }
};

export function isAxiosError(error: unknown): error is AxiosError {
  return (error as AxiosError)?.isAxiosError === true;
}
