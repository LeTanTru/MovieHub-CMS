import { envConfig } from '@/config';
import type { ResponseCookie } from 'next/dist/compiled/@edge-runtime/cookies';

const SKEW_SECONDS = 30;

export const makeCookieOption = (maxAge: number): Partial<ResponseCookie> => ({
  path: '/',
  httpOnly: true,
  sameSite: 'lax',
  secure: envConfig.NEXT_PUBLIC_NODE_ENV !== 'development',
  maxAge: Math.max(1, maxAge - SKEW_SECONDS)
});
