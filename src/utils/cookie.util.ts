'use server';

import type { ResponseCookie } from 'next/dist/compiled/@edge-runtime/cookies';
import { cookies } from 'next/headers';

/**
 * @param key The name of the cookie
 * @param value The value to store in the cookie
 * @param cookie Optional configuration for the cookie (e.g., expiration, path)
 */
export const setCookie = async (
  key: string,
  value: string,
  cookie?: Partial<ResponseCookie>
) => {
  const cookieStore = await cookies();
  cookieStore.set(key, value, cookie);
};

/**
 * @param key The name of the cookie to retrieve
 */
export const getCookie = async (key: string) => {
  const cookieStore = await cookies();
  return cookieStore.get(key)?.value || null;
};

/**
 * @param key The name of the cookie to remove
 */
export const removeCookie = async (key: string) => {
  const cookieStore = await cookies();
  cookieStore.delete(key);
};
