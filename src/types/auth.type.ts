import { loginSchema } from '@/schemaValidations';
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
  userKind: string | null;
};

type AuthStoreState = {
  profile: ProfileResType | null;
  isLoggedOut: boolean;
  accessToken: string | null;
  userKind: string | null;
};

type AuthStoreActions = {
  setProfile: (profile: ProfileResType | null) => void;
  setAccessToken: (token: string | null) => void;
  setUserKind: (kind: string | null) => void;
  clearState: () => void;
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
