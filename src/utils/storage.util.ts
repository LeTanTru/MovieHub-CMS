const isBrowser = () => typeof window !== 'undefined';

export const setData = (key: string, value: string): void => {
  if (isBrowser()) {
    localStorage.setItem(key, value);
  }
};

export const getData = (key: string): string | null => {
  return isBrowser() ? localStorage.getItem(key) : null;
};

export const removeData = (key: string | string[]): void => {
  if (isBrowser()) {
    if (Array.isArray(key)) {
      key.forEach((k) => localStorage.removeItem(k));
    } else {
      localStorage.removeItem(key);
    }
  }
};
