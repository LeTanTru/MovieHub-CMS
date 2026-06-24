import { loginSchema } from '@/schema-validations';
import type { ProfileResType } from '@/types/account.type';
import { z } from 'zod';

export type LoginBodyType = z.infer<typeof loginSchema>;
export type LoginResType = {
  access_token: string;
  token_type: string;
  refresh_token: string;
  expires_in: number;
  scope: string;
  user_kind: number;
  user_id: string;
  grant_type: string;
  additional_info: string;
  jti: string;
};

export type SessionResType = {
  accessToken: string | null;
  csrfToken: string | null;
  userKind: number | null;
};

type AuthStoreState = {
  accessToken: string | null;
  csrfToken: string | null;
  profile: ProfileResType | null;
  userKind: number | null;
};

type AuthStoreActions = {
  clearState: () => void;
  setAccessToken: (token: string | null) => void;
  setCsrfToken: (token: string | null) => void;
  setProfile: (profile: ProfileResType | null) => void;
  setUserKind: (kind: number | null) => void;
};

export type AuthStoreType = AuthStoreState & AuthStoreActions;

export type RefreshTokenResType = {
  access_token: string;
  token_type: string;
  refresh_token: string;
  expires_in: number;
  scope: string;
  user_kind: number;
  user_id: string;
  grant_type: string;
  additional_info: string;
  jti: string;
};

export type JwtType = {
  user_kind: number;
  user_id: string;
  grant_type: string;
  additional_info: string;
  user_name: string;
  scope: string[];
  exp: number;
  authorities: string[];
  jti: string;
  client_id: string;
};
