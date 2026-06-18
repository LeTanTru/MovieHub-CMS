import type {
  AppVersionBodyType,
  ErrorMaps,
  ServerConfigBodyType,
  SettingBodyType,
  StyleBodyType
} from '@/types';
import { ErrorCode } from './error-code';

export const appVersionErrorMaps: ErrorMaps<AppVersionBodyType> = {
  [ErrorCode.APP_VERSION_ERROR_NAME_EXIST]: [
    ['name', { type: 'manual', message: 'Tên phiên bản đã tồn tại' }]
  ]
};

export const serverConfigErrorMaps: ErrorMaps<ServerConfigBodyType> = {
  [ErrorCode.SERVER_CONFIG_ERROR_SERVER_NUMBER_EXISTED]: [
    ['serverNumber', { type: 'manual', message: 'Máy chủ No. đã tồn tại' }]
  ],
  [ErrorCode.SERVER_CONFIG_ERROR_HOSTNAME_EXISTED]: [
    ['hostname', { type: 'manual', message: 'Hostname đã tồn tại' }]
  ],
  [ErrorCode.SERVER_CONFIG_ERROR_IP_PORT_EXISTED]: [
    [
      'port',
      {
        type: 'manual',
        message: 'Cổng đã tồn tại với IP này'
      }
    ]
  ]
};

export const settingErrorMaps: ErrorMaps<SettingBodyType> = {
  [ErrorCode.SETTING_ERROR_EXISTED_GROUP_NAME_AND_KEY_NAME]: [
    [
      'keyName',
      {
        type: 'manual',
        message: 'Tên cài đặt đã tồn tại'
      }
    ]
  ]
};

export const styleErrorMaps: ErrorMaps<StyleBodyType> = {
  [ErrorCode.STYLE_ERROR_TYPE_EXIST]: [
    ['type', { type: 'manual', message: 'Loại thiết kế đã tồn tại' }]
  ]
};
