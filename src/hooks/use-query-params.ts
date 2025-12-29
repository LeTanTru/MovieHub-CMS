'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';

const useQueryParams = <S extends Record<string, any>>() => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const getQueryParam = (key: keyof S) => {
    return searchParams.get(String(key));
  };

  const setQueryParam = (key: keyof S, value: S[keyof S] | null) => {
    const params = new URLSearchParams(searchParams.toString());

    if (value === null || value === '') {
      params.delete(String(key));
    } else {
      params.set(String(key), String(value));
    }

    const sortedParams = new URLSearchParams();
    [...params.keys()].sort().forEach((k) => {
      const v = params.get(k);
      if (v !== null) sortedParams.set(k, v);
    });

    router.push(`${pathname}?${sortedParams.toString()}`);
  };

  const setQueryParams = (newParams: Partial<S>) => {
    const queryString = serializeParams(newParams as Record<string, any>);
    router.push(queryString ? `${pathname}?${queryString}` : pathname);
  };

  const serializeParams = (obj: Record<string, any>) => {
    return Object.entries(obj)
      .filter(([_, v]) => v !== null && v !== undefined && v !== '')
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
      .join('&');
  };

  const deserializeParams = (str: string) => {
    return str.split('&').reduce(
      (acc, part) => {
        const [key, value] = part.split('=');
        if (key) {
          acc[decodeURIComponent(key)] = decodeURIComponent(value || '');
        }
        return acc;
      },
      {} as Record<string, string>
    );
  };

  const paramsObject = Object.fromEntries(searchParams.entries()) as Partial<S>;
  const queryString = serializeParams(paramsObject);

  return {
    queryString,
    searchParams: paramsObject,
    serializeParams,
    deserializeParams,
    getQueryParam,
    setQueryParam,
    setQueryParams
  };
};

export default useQueryParams;
