import { apiConfig, queryKeys } from '@/constants';
import type {
  ApiResponseList,
  GroupAutoCompleteResType,
  GroupSearchType
} from '@/types';
import { http } from '@/utils';
import { useQuery } from '@tanstack/react-query';

export const useGroupListQuery = (params?: GroupSearchType) => {
  return useQuery({
    queryKey: [queryKeys.GROUP_LIST, params],
    queryFn: ({ signal }) =>
      http.get<ApiResponseList<GroupAutoCompleteResType>>(
        apiConfig.group.autoComplete,
        {
          params,
          signal
        }
      ),
    select: (data) => data.data
  });
};
