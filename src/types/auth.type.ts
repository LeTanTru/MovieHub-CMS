import { loginSchema } from '@/schemaValidations';
import { ProfileResType } from '@/types/account.type';
import z from 'zod';

export type LoginBodyType = z.infer<typeof loginSchema>;
export type LoginResType = {
  access_token: string;
  token_type: string;
  refresh_token: string;
  expires_in: number;
  scope: string;
  user_kind: number;
  tenant_info: string;
  user_id: number;
  grant_type: string;
  additional_info: string;
  jti: string;
};

export type AuthStoreType = {
  isAuthenticated: boolean;
  profile: ProfileResType | null;
  loading: boolean;
  isLoggedOut: boolean;

  setAuthenticated: (isAuthenticated: boolean) => void;
  setProfile: (profile: ProfileResType | null) => void;
  setLoading: (loading: boolean) => void;
  setIsLoggedOut: (isLogout: boolean) => void;
};

export type RefreshTokenBodyType = {
  refresh_token: string;
  grant_type: string;
};
