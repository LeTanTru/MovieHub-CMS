const isBrowser = () => typeof window !== 'undefined';

/**
 * @param key The local storage key
 * @param value The value to save
 */
export const setData = (key: string, value: string): void => {
  if (isBrowser()) {
    localStorage.setItem(key, value);
  }
};

/**
 * @param key The local storage key to retrieve
 */
export const getData = (key: string): string | null => {
  return isBrowser() ? localStorage.getItem(key) : null;
};

/**
 * @param key The local storage key or array of keys to remove
 */
export const removeData = (key: string | string[]): void => {
  if (isBrowser()) {
    if (Array.isArray(key)) {
      key.forEach((k) => localStorage.removeItem(k));
    } else {
      localStorage.removeItem(key);
    }
  }
};
