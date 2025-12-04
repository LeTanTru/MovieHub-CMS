import { ApiConfig, ApiResponseList } from '@/types';
import { http } from '@/utils';
import {
  useInfiniteQuery,
  UseInfiniteQueryOptions
} from '@tanstack/react-query';

export type InfiniteQueryParams = Record<string, any>;

type UseInfiniteListQueryOptions<TData, TParams extends InfiniteQueryParams> = {
  queryKey: string;
  apiConfig: ApiConfig;
  params?: TParams;
  enabled?: boolean;
  queryOptions?: Omit<
    UseInfiniteQueryOptions<
      ApiResponseList<TData>,
      Error,
      ApiResponseList<TData>
    >,
    'queryKey' | 'queryFn' | 'getNextPageParam' | 'enabled'
  >;
};

export default function useInfiniteListQuery<
  TData,
  TParams extends InfiniteQueryParams
>({
  queryKey,
  apiConfig,
  params,
  enabled = true,
  queryOptions
}: UseInfiniteListQueryOptions<TData, TParams>) {
  return useInfiniteQuery<
    ApiResponseList<TData>,
    Error,
    ApiResponseList<TData>
  >({
    queryKey: [queryKey, params],
    queryFn: ({ pageParam = 0 }) =>
      http.get<ApiResponseList<TData>>(apiConfig, {
        params: { ...params, page: pageParam }
      }),
    getNextPageParam: (lastPage, allPages) => {
      const nextPage = allPages.length;
      return nextPage < lastPage.data.totalPages ? nextPage : undefined;
    },
    initialPageParam: 0,
    enabled,
    ...queryOptions
  });
}
