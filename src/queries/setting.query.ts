import { apiConfig, MAX_PAGE_SIZE, queryKeys } from '@/constants';
import type { ApiResponseList, SettingResType } from '@/types';
import { http } from '@/utils';
import { useQuery } from '@tanstack/react-query';

export const useSettingListQuery = () => {
  return useQuery({
    queryKey: [queryKeys.SETTING_AUTO_COMPLETE],
    queryFn: () =>
      http.get<ApiResponseList<SettingResType>>(
        apiConfig.setting.autoComplete,
        {
          params: {
            size: MAX_PAGE_SIZE
          }
        }
      )
  });
};
