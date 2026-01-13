import { apiConfig, queryKeys } from '@/constants';
import type {
  ApiResponseList,
  CollectionResType,
  CollectionSearchType
} from '@/types';
import { http } from '@/utils';
import { useQuery } from '@tanstack/react-query';

export const useCollectionListQuery = ({
  params
}: {
  params: CollectionSearchType;
}) => {
  return useQuery({
    queryKey: [`${queryKeys.COLLECTION}-list`],
    queryFn: () =>
      http.get<ApiResponseList<CollectionResType>>(
        apiConfig.collection.getList,
        {
          params
        }
      )
  });
};
