'use client';

import { useIsomorphicLayoutEffect } from '@/hooks';
import DisableDevtool from 'disable-devtool';
import { disableReactDevTools } from '@fvilers/disable-react-devtools';
import { envConfig } from '@/config';
import { usePublicSettingQuery } from '@/queries';
import { IS_DEV_MODE } from '@/constants';

if (
  typeof window !== 'undefined' &&
  envConfig.NEXT_PUBLIC_NODE_ENV === 'production'
) {
  disableReactDevTools();
}

export function DevToolsBlockerProvider() {
  const { data: settingList, isSuccess } = usePublicSettingQuery();

  const devModeSetting = settingList?.find(
    (setting) => setting.keyName === IS_DEV_MODE
  );

  const isDevMode = devModeSetting?.valueData === 'true';

  useIsomorphicLayoutEffect(() => {
    if (
      isSuccess &&
      envConfig.NEXT_PUBLIC_NODE_ENV === 'production' &&
      !isDevMode
    ) {
      DisableDevtool();
    }
  }, [isSuccess, isDevMode]);

  return null;
}
