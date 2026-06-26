import { envConfig } from '@/config';
import { apiConfig, ENV_DEVELOPMENT, storageKeys } from '@/constants';
import { logger } from '@/logger';
import { route } from '@/routes';
import type { ApiConfig, Payload } from '@/types';
import { useAuthStore } from '@/store';
import { getCookie } from './cookie.util';
import { buildLoginRedirectPath } from './url.util';
import axios, {
  AxiosError,
  HttpStatusCode,
  type InternalAxiosRequestConfig,
  type AxiosRequestConfig,
  type AxiosResponse
} from 'axios';
import { redirect, unstable_rethrow } from 'next/navigation';

const isClient = typeof window !== 'undefined';
const axiosInstance = axios.create();
const authAxios = axios.create();
const TIME_OUT = 10000;

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: string | null) => void;
  reject: (error: unknown) => void;
}> = [];

type RequestConfigWithRetry = InternalAxiosRequestConfig & {
  _retry?: boolean;
};

/**
 * @param error The error that caused the queue to process, or null if successful
 * @param token The new access token to resolve the queue with, or null on error
 */
const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  if (process.env.NODE_ENV === ENV_DEVELOPMENT) {
    logger.info(failedQueue);
  }
  failedQueue = [];
};

/**
 */
const refreshToken = async () => {
  const res = await authAxios.post(
    apiConfig.api.auth.refreshToken.baseUrl,
    null,
    {
      timeout: TIME_OUT
    }
  );
  const data = res.data;

  if (data?.result && data?.data) {
    const newAccessToken = data.data.access_token;
    const userKind = data.data.user_kind;
    const newCsrfToken = data.data.csrfToken;
    if (isClient) {
      useAuthStore.getState().setAccessToken(newAccessToken);
      useAuthStore.getState().setUserKind(userKind);
      useAuthStore.getState().setCsrfToken(newCsrfToken);
    }
    return newAccessToken;
  }

  return null;
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
      } catch (error) {
        unstable_rethrow(error);
        if (isAxiosError(error)) {
          const response = error.response?.data;

          logger.error('[REFRESH_TOKEN_ERROR]', response);
        } else {
          logger.error('[REFRESH_TOKEN_ERROR]', error);
        }

        if (
          error instanceof AxiosError &&
          (error?.response?.status === HttpStatusCode.BadRequest ||
            error?.response?.status === HttpStatusCode.Unauthorized ||
            error?.response?.status === HttpStatusCode.Forbidden)
        ) {
          try {
            await authAxios.post(apiConfig.api.auth.logout.baseUrl);
          } catch (e) {
            logger.error('[LOGOUT_ON_REFRESH_FAILED]', e);
          }
          if (isClient) {
            useAuthStore.getState().clearState();
            const loginRedirectPath = buildLoginRedirectPath(
              window.location.pathname,
              window.location.search
            );
            window.location.href = new URL(
              loginRedirectPath,
              window.location.origin
            ).toString();
          } else {
            let redirectUrl = route.login.path;
            try {
              const { headers } = await import('next/headers');
              const headersList = await headers();
              const reqUrl = headersList.get(storageKeys.X_URL);
              if (reqUrl) {
                const parsedUrl = new URL(reqUrl);
                redirectUrl = buildLoginRedirectPath(
                  parsedUrl.pathname,
                  parsedUrl.search
                );
              }
            } catch (e) {
              logger.error('[SERVER_REDIRECT_ERROR]', e);
            }
            redirect(redirectUrl);
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

/**
 * @param apiConfig The API configuration (url, method, headers, etc.)
 * @param payload The request payload (body, params, pathParams, etc.)
 */
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
    isRequiredCsrfToken,
    isUpload
  } = apiConfig;

  const {
    params = {},
    pathParams = {},
    body = {},
    options = {},
    authorization,
    signal
  } = payload;

  let accessToken: string | null = '';
  let clientType: string | null | undefined = '';
  let csrfToken: string | null = '';

  if (!ignoreAuth) {
    if (isClient) {
      accessToken = useAuthStore.getState().accessToken;
    } else {
      accessToken = await getCookie(storageKeys.ACCESS_TOKEN);
    }
  }

  if (isRequiredCsrfToken) {
    if (isClient) {
      csrfToken = useAuthStore.getState().csrfToken;
    } else {
      csrfToken = await getCookie(storageKeys.CSRF_TOKEN);
    }
  }

  if (isRequiredXClientType) {
    clientType = envConfig.NEXT_PUBLIC_CLIENT_TYPE;
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

  if (isRequiredCsrfToken && csrfToken) {
    baseHeader[storageKeys.X_CSRF_TOKEN] = csrfToken;
  }

  Object.entries(pathParams).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      baseUrl = baseUrl.replace(`:${key}`, value.toString());
    }
  });

  try {
    const axiosConfig: AxiosRequestConfig = {
      url: baseUrl,
      method,
      headers: baseHeader,
      params,
      timeout: TIME_OUT,
      signal,
      ...options
    };

    if (isUpload && body instanceof FormData) {
      axiosConfig.data = body;

      delete axiosConfig.headers!['Content-Type'];
    } else if (isUpload && body && typeof body === 'object') {
      const formData = new FormData();
      const bodyObj = body as Record<string, unknown>;

      Object.keys(bodyObj).forEach((key) => {
        const value = bodyObj[key];

        if (value instanceof Blob) {
          let filename = 'upload';

          if (value instanceof File && value.name) {
            filename = value.name;
          } else {
            const ext = value.type.split('/').pop() || 'bin';
            filename = `upload.${ext}`;
          }

          formData.append(key, value, filename);
        } else if (value !== null && value !== undefined) {
          formData.append(
            key,
            typeof value === 'object' ? JSON.stringify(value) : String(value)
          );
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
  } catch (error: unknown) {
    throw error;
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

/**
 * @param error The error object to check
 */
export function isAxiosError(error: unknown): error is AxiosError {
  return (error as AxiosError)?.isAxiosError === true;
}
