import { ApiConfig, ApiResponseList } from '@/types';
import { http } from '@/utils';
import { useInfiniteQuery } from '@tanstack/react-query';

export default function useInfiniteListQuery<TData, TParams = void>({
  queryKey,
  apiConfig,
  params,
  enabled
}: {
  queryKey: string[];
  apiConfig: ApiConfig;
  params?: TParams;
  enabled: boolean;
}) {
  const query = useInfiniteQuery<ApiResponseList<TData>, unknown>({
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
    enabled
  });
  return { ...query, data: query.data?.pages?.[0] };
}
