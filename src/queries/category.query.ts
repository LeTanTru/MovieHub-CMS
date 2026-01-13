import { apiConfig, MAX_PAGE_SIZE, queryKeys } from '@/constants';
import type { ApiResponseList, CategoryResType } from '@/types';
import { http } from '@/utils';
import { useQuery } from '@tanstack/react-query';

export const useCategoryListQuery = () => {
  return useQuery({
    queryKey: [`${queryKeys.CATEGORY}-list`],
    queryFn: () =>
      http.get<ApiResponseList<CategoryResType>>(apiConfig.category.getList, {
        params: {
          size: MAX_PAGE_SIZE
        }
      })
  });
};
