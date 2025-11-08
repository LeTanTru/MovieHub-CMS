import { storageKeys } from '@/constants';

const isBrowser = () => typeof window !== 'undefined';

export const setData = (key: string, value: string): void => {
  if (isBrowser()) {
    localStorage.setItem(key, value);
  }
};

export const getData = (key: string): string | null => {
  return isBrowser() ? localStorage.getItem(key) : null;
};

export const removeData = (key: string): void => {
  if (isBrowser()) {
    localStorage.removeItem(key);
  }
};

export const setAccessTokenToLocalStorage = (token: string): void =>
  setData(storageKeys.ACCESS_TOKEN, token);

export const getAccessTokenFromLocalStorage = (): string | null =>
  getData(storageKeys.ACCESS_TOKEN);

export const setRefreshTokenToLocalStorage = (token: string): void =>
  setData(storageKeys.REFRESH_TOKEN, token);

export const getRefreshTokenFromLocalStorage = (): string | null =>
  getData(storageKeys.REFRESH_TOKEN);

export const removeAccessTokenFromLocalStorage = (): void =>
  removeData(storageKeys.ACCESS_TOKEN);

export const removeRefreshTokenFromLocalStorage = (): void =>
  removeData(storageKeys.REFRESH_TOKEN);
