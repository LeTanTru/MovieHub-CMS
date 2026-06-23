import { apiConfig, queryKeys } from '@/constants';
import { ApiResponse, PublicSettingResType } from '@/types';
import { http } from '@/utils';
import { useQuery } from '@tanstack/react-query';

export const usePublicSettingQuery = () => {
  return useQuery({
    queryKey: [queryKeys.PUBLIC_SETTING],
    queryFn: () =>
      http.get<ApiResponse<PublicSettingResType[]>>(apiConfig.setting.public),
    select: (data) => data?.data || []
  });
};
