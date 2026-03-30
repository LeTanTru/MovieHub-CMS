import { apiConfig, queryKeys } from '@/constants';
import type {
  ApiResponseList,
  GroupAutoCompleteResType,
  GroupSearchType
} from '@/types';
import { http } from '@/utils';
import { keepPreviousData, useQuery } from '@tanstack/react-query';

export const useGroupListQuery = (params?: GroupSearchType) => {
  return useQuery({
    queryKey: [`${queryKeys.GROUP}-list`, params],
    queryFn: () =>
      http.get<ApiResponseList<GroupAutoCompleteResType>>(
        apiConfig.group.autoComplete,
        {
          params
        }
      ),
    placeholderData: keepPreviousData
  });
};
