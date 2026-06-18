import type {
  ErrorMaps,
  GroupBodyType,
  GroupPermissionBodyType,
  PermissionBodyType
} from '@/types';
import { ErrorCode } from './error-code';

export const groupErrorMaps: ErrorMaps<GroupBodyType> = {
  [ErrorCode.GROUP_ERROR_NAME_EXIST]: [
    ['name', { type: 'manual', message: 'Vai trò đã tồn tại' }]
  ],
  [ErrorCode.GROUP_ERROR_NOT_FOUND]: [
    ['name', { type: 'manual', message: 'Vai trò không tồn tại' }]
  ]
};

export const groupPermissionErrorMaps: ErrorMaps<GroupPermissionBodyType> = {
  [ErrorCode.GROUP_PERMISSION_ERROR_NAME_EXIST]: [
    ['name', { type: 'manual', message: 'Tên nhóm quyền đã tồn tại' }]
  ]
};

export const permissionErrorMaps: ErrorMaps<PermissionBodyType> = {
  [ErrorCode.PERMISSION_ERROR_NAME_EXIST]: [
    ['name', { type: 'manual', message: 'Tên quyền đã tồn tại' }]
  ],
  [ErrorCode.PERMISSION_ERROR_CODE_EXIST]: [
    ['permissionCode', { type: 'manual', message: 'Mã quyền đã tồn tại' }]
  ]
};
