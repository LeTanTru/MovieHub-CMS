import { apiConfig, queryKeys } from '@/constants';
import type {
  ApiResponseList,
  CollectionItemResType,
  CollectionItemSearchType
} from '@/types';
import { http } from '@/utils';
import { useQuery } from '@tanstack/react-query';

export const useCollectionItemListQuery = ({
  params
}: {
  params: CollectionItemSearchType;
}) => {
  return useQuery({
    queryKey: [`${queryKeys.COLLECTION_ITEM}-list`, params],
    queryFn: () =>
      http.get<ApiResponseList<CollectionItemResType>>(
        apiConfig.collectionItem.getList,
        {
          params
        }
      )
  });
};
