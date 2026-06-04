import { PARENT_PREFIX_PARAM } from '@/constants';
import { useNavigate } from '@/hooks/use-navigate';
import { usePathname, useSearchParams } from 'next/navigation';

export const useQueryParams = <S extends Record<string, unknown>>() => {
  const navigate = useNavigate();
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

    const sortedParams = [...params.keys()]
      .toSorted()
      .map((k) => {
        const v = params.get(k);
        return v !== null
          ? `${encodeURIComponent(k)}=${encodeURIComponent(v)}`
          : null;
      })
      .filter(Boolean)
      .join('&');

    navigate.push(`${pathname}?${sortedParams}`);
  };

  const setQueryParams = (newParams: Partial<S>) => {
    const queryString = serializeParams(newParams as Record<string, unknown>);
    navigate.push(queryString ? `${pathname}?${queryString}` : pathname);
  };

  const serializeParams = (obj: Record<string, unknown>) => {
    return Object.entries(obj)
      .filter(([_, v]) => v !== null && v !== undefined && v !== '')
      .toSorted(([a], [b]) => a.localeCompare(b))
      .map(
        ([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`
      )
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

  const prefixParams = (
    params: Record<string, unknown>,
    prefix = PARENT_PREFIX_PARAM
  ): Record<string, unknown> => {
    return Object.fromEntries(
      Object.entries(params).map(([key, val]) => [`${prefix}${key}`, val])
    );
  };

  const deprefixParams = (
    params: Record<string, unknown>,
    prefix = PARENT_PREFIX_PARAM
  ): Record<string, unknown> => {
    return Object.fromEntries(
      Object.entries(params)
        .filter(([key]) => key.startsWith(prefix))
        .map(([key, val]) => [key.slice(prefix.length), val])
    );
  };

  return {
    queryString,
    searchParams: paramsObject,
    serializeParams,
    deserializeParams,
    getQueryParam,
    setQueryParam,
    setQueryParams,
    prefixParams,
    deprefixParams
  };
};
