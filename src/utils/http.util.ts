import envConfig from '@/config';
import { apiConfig, storageKeys } from '@/constants';
import { logger } from '@/logger';
import type {
  ApiConfig,
  ApiResponse,
  Payload,
  RefreshTokenResType
} from '@/types';
import {
  getAccessTokenFromLocalStorage,
  removeAccessTokenFromLocalStorage,
  getData,
  getRefreshTokenFromLocalStorage,
  removeRefreshTokenFromLocalStorage,
  setAccessTokenToLocalStorage,
  setRefreshTokenToLocalStorage,
  isTokenExpired,
  getAccessTokenFromCookie,
  getRefreshTokenFromCookie,
  removeAccessTokenFromCookie,
  removeRefreshTokenFromCookie,
  setAccessTokenToCookie,
  setRefreshTokenToCookie
} from '@/utils';
import axios, {
  AxiosError,
  HttpStatusCode,
  type InternalAxiosRequestConfig,
  type AxiosRequestConfig,
  type AxiosResponse
} from 'axios';

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
  try {
    let token: string | null = null;
    if (isClient()) {
      token = getRefreshTokenFromLocalStorage();
    } else {
      token = await getRefreshTokenFromCookie();
    }
    if (!token || isTokenExpired(token)) {
      if (isClient()) {
        removeAccessTokenFromLocalStorage();
        removeRefreshTokenFromLocalStorage();
        // window.location.href = route.login.path;
      } else {
        await removeAccessTokenFromCookie();
        await removeRefreshTokenFromCookie();
      }
      return;
    }
    const response: ApiResponse<RefreshTokenResType> = await axios.post(
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
    const data = response.data;
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
    return response.data?.access_token;
  } catch (error) {
    logger.error('Error while refreshing access token', error);
  }
};

axiosInstance.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    logger.error('Error in http util', error);
    const originalConfig = error.config as RequestConfigWithRetry;
    if (originalConfig && error.status === HttpStatusCode.Unauthorized) {
      if (
        originalConfig._retry ||
        originalConfig.url?.includes(apiConfig.auth.refreshToken.baseUrl)
      ) {
        if (isClient()) {
          removeAccessTokenFromLocalStorage();
          removeRefreshTokenFromLocalStorage();
          // window.location.href = route.login.path;
        } else {
          await removeAccessTokenFromCookie();
          await removeRefreshTokenFromCookie();
        }
      }

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

      originalConfig._retry = true;
      isRefreshing = true;

      try {
        const newAccessToken = await refreshToken();

        if (originalConfig.headers && newAccessToken) {
          originalConfig.headers['Authorization'] = `Bearer ${newAccessToken}`;
        }

        processQueue(null, newAccessToken);
        isRefreshing = false;

        return axiosInstance.request(originalConfig);
      } catch (refreshError) {
        processQueue(refreshError, null);
        isRefreshing = false;
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export const sendRequest = async <T>(
  apiConfig: ApiConfig,
  payload: Payload = {}
): Promise<T> => {
  let { baseUrl, headers, method, ignoreAuth, isRequiredTenantId, isUpload } =
    apiConfig;

  const {
    params = {},
    pathParams = {},
    body = {},
    options = {},
    authorization
  } = payload;

  let accessToken: string | null = '';
  let tenantId: string | null | undefined = '';

  if (!ignoreAuth) {
    if (isClient()) {
      accessToken = getAccessTokenFromLocalStorage();
    } else {
      accessToken = await getAccessTokenFromCookie();
    }
  }

  if (isRequiredTenantId) {
    if (isClient()) {
      tenantId =
        getData(storageKeys.X_TENANT) || envConfig.NEXT_PUBLIC_TENANT_ID;
    } else {
      tenantId = process.env.TENANT_ID;
    }
  }

  const baseHeader: Record<string, string> = { ...headers };

  if (!ignoreAuth && accessToken) {
    baseHeader['Authorization'] = `Bearer ${accessToken}`;
  }

  if (authorization) {
    baseHeader['Authorization'] = authorization;
  }

  if (tenantId) {
    baseHeader[storageKeys.X_TENANT] = tenantId;
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

    const response: AxiosResponse = await axiosInstance.request<T>(axiosConfig);
    return response.data;
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
