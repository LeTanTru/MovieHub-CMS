import { loginSchema } from '@/schemaValidations';
import { CustomerResType } from '@/types/customer.type';
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
  profile: CustomerResType | null;
  loading: boolean;
  setAuthenticated: (isAuthenticated: boolean) => void;
  setProfile: (profile: CustomerResType | null) => void;
  setLoading: (loading: boolean) => void;
};
