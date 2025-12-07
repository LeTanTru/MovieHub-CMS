import { AxiosRequestConfig } from 'axios';

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export type ApiConfig = {
  baseUrl: string;
  headers?: Record<string, string>;
  method: HttpMethod;
  permissionCode?: string;
  isRequiredTenantId?: boolean;
  ignoreAuth?: boolean;
  isUpload?: boolean;
};

export type ApiConfigGroup = {
  [key: string]: ApiConfig | ApiConfigGroup | string;
};

export type Payload = {
  params?: Record<string, any>;
  pathParams?: Record<string, string | number>;
  body?: any;
  options?: AxiosRequestConfig;
  authorization?: string;
};

export type ApiResponse<T> = {
  data?: T;
  message?: string;
  result?: boolean;
  code?: string;
};

export type ApiResponseList<T> = {
  result?: boolean;
  data: {
    content: T[];
    totalElements: number;
    totalPages: number;
  };
  message?: string;
};
