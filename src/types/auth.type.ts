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
  user_id: number;
  grant_type: string;
  additional_info: string;
  jti: string;
};

type AuthStoreState = {
  profile: ProfileResType | null;
  isLoggedOut: boolean;
};

type AuthStoreActions = {
  setProfile: (profile: ProfileResType | null) => void;
  setIsLoggedOut: (isLogout: boolean) => void;
};

export type AuthStoreType = AuthStoreState & AuthStoreActions;

export type RefreshTokenResType = {
  access_token: string;
  token_type: string;
  refresh_token: string;
  expires_in: number;
  scope: string;
  user_kind: number;
  user_id: number;
  grant_type: string;
  additional_info: string;
  jti: string;
};
