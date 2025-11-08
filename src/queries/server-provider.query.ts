import { apiConfig, queryKeys } from '@/constants';
import { ApiResponseList, ServerProviderResType } from '@/types';
import { http } from '@/utils';
import { useQuery } from '@tanstack/react-query';

export const useServerProviderListQuery = ({
  enabled
}: {
  enabled: boolean;
}) => {
  return useQuery({
    queryKey: [`${queryKeys.SERVER_PROVIDER}-auto-complete`],
    queryFn: () =>
      http.get<ApiResponseList<ServerProviderResType>>(
        apiConfig.serverProvider.autoComplete
      ),
    enabled
  });
};
