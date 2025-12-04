import { ApiConfig, ApiResponseList } from '@/types';
import { http } from '@/utils';
import {
  useInfiniteQuery,
  UseInfiniteQueryOptions,
  InfiniteData
} from '@tanstack/react-query';

type InfiniteListQueryOptions<TData, TError> = Omit<
  UseInfiniteQueryOptions<
    ApiResponseList<TData>,
    TError,
    InfiniteData<ApiResponseList<TData>, number>,
    string[],
    number
  >,
  'queryKey' | 'queryFn' | 'getNextPageParam' | 'initialPageParam'
>;

type UseInfiniteListQueryProps<TData, TParams, TError = unknown> = {
  queryKey: string[];
  apiConfig: ApiConfig;
  enabled: boolean;
  params?: TParams;
  options?: InfiniteListQueryOptions<TData, TError>;
};

export default function useInfiniteListQuery<
  TData,
  TParams = void,
  TError = unknown
>({
  queryKey,
  apiConfig,
  params,
  options,
  enabled
}: UseInfiniteListQueryProps<TData, TParams, TError>) {
  const query = useInfiniteQuery<
    ApiResponseList<TData>,
    TError,
    InfiniteData<ApiResponseList<TData>, number>,
    string[],
    number
  >({
    queryKey,
    queryFn: async ({ pageParam = 0 }) => {
      const res = await http.get<ApiResponseList<TData>>(apiConfig, {
        params: { ...params, page: pageParam }
      });
      return res;
    },
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.data.totalPages > allPages.length
        ? allPages.length
        : undefined;
    },
    initialPageParam: 0,
    enabled,
    ...options
  });

  return { ...query, data: query.data?.pages?.[0] };
}
