import envConfig from '@/config';
import type { ResponseCookie } from 'next/dist/compiled/@edge-runtime/cookies';

export const makeCookieOption = (maxAge: number): Partial<ResponseCookie> => ({
  path: '/',
  httpOnly: true,
  sameSite: 'lax',
  secure: envConfig.NEXT_PUBLIC_NODE_ENV !== 'development',
  maxAge: maxAge
});
