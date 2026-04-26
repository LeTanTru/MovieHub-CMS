'use server';

import { storageKeys } from '@/constants';
import { ResponseCookie } from 'next/dist/compiled/@edge-runtime/cookies';
import { cookies } from 'next/headers';

export const setCookieData = async (
  key: string,
  value: any,
  cookie?: Partial<ResponseCookie>
): Promise<void> => {
  const cookieStore = await cookies();
  cookieStore.set(key, value, cookie);
};

export const getCookieData = async (
  key: string
): Promise<{ name: string; value: string } | undefined> => {
  const cookieStore = await cookies();
  return cookieStore.get(key);
};

export const removeCookieData = async (key: string): Promise<void> => {
  const cookieStore = await cookies();
  cookieStore.delete(key);
};

export const setAccessTokenToCookie = async (
  token: string,
  cookie?: Partial<ResponseCookie>
): Promise<void> => {
  await setCookieData(storageKeys.ACCESS_TOKEN, token, cookie);
};

export const getAccessTokenFromCookie = async (): Promise<string | null> => {
  const cookie = await getCookieData(storageKeys.ACCESS_TOKEN);
  return cookie?.value || null;
};

export const setRefreshTokenToCookie = async (
  token: string,
  cookie?: Partial<ResponseCookie>
): Promise<void> => {
  await setCookieData(storageKeys.REFRESH_TOKEN, token, cookie);
};

export const getRefreshTokenFromCookie = async (): Promise<string | null> => {
  const cookie = await getCookieData(storageKeys.REFRESH_TOKEN);
  return cookie?.value || null;
};

export const removeAccessTokenFromCookie = async (): Promise<void> => {
  await removeCookieData(storageKeys.ACCESS_TOKEN);
};

export const removeRefreshTokenFromCookie = async (): Promise<void> => {
  await removeCookieData(storageKeys.REFRESH_TOKEN);
};
