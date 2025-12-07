import envConfig from '@/config';
import { storageKeys } from '@/constants';
import { ApiConfig, Payload } from '@/types';
import {
  getAccessTokenFromLocalStorage,
  removeAccessTokenFromLocalStorage,
  getData,
  isTokenExpired,
  getCookiesServer
} from '@/utils';
import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';

const isClient = () => typeof window !== 'undefined';

// const TIME_OUT = 10000;

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
      if (isTokenExpired(accessToken)) {
        removeAccessTokenFromLocalStorage();
        accessToken = null;
      }
    } else {
      const { sessionToken } = await getCookiesServer();
      accessToken = sessionToken;
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
          const ext = value.type.split('/')[1] || 'jpg';
          formData.append(key, value, `upload.${ext}`);
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

    const response: AxiosResponse = await axios.request<T>(axiosConfig);
    return response.data;
  } catch (error: any) {
    const err = error as AxiosError;
    throw err;
  }
};

const http = {
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

export { http };
