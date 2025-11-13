import {
  CategoryBodyType,
  EmployeeBodyType,
  ErrorMaps,
  GroupBodyType,
  PermissionBodyType
} from '@/types';
import { GroupPermissionBodyType } from '@/types/group-permission.type';

export const ErrorCode = {
  // === Group error code ===
  GROUP_ERROR_NAME_EXIST: 'ERROR-GROUP-000',
  GROUP_ERROR_NOT_FOUND: 'ERROR-GROUP-001',
  GROUP_ERROR_INVALID_TENANT_ID: 'ERROR-GROUP-002',
  GROUP_ERROR_NOT_ALLOWED_CREATE: 'ERROR-GROUP-003',
  GROUP_ERROR_NOT_ALLOWED_DELETE: 'ERROR-GROUP-004',
  GROUP_ERROR_KIND_EXISTED: 'ERROR-GROUP-005',
  GROUP_ERROR_SUB_KIND_EXISTED: 'ERROR-GROUP-006',

  // === Permission error code ===
  PERMISSION_ERROR_NAME_EXIST: 'ERROR-PERMISSION-000',
  PERMISSION_ERROR_CODE_EXIST: 'ERROR-PERMISSION-001',
  PERMISSION_ERROR_NOT_FOUND: 'ERROR-PERMISSION-002',

  // === GroupPermission error code ===
  GROUP_PERMISSION_ERROR_NOT_FOUND: 'ERROR-GROUP-PERMISSION-000',
  GROUP_PERMISSION_ERROR_NAME_EXIST: 'ERROR-GROUP-PERMISSION-001',

  // === Account error code ===
  ACCOUNT_ERROR_NOT_FOUND: 'ERROR-ACCOUNT-ERROR-0000',
  ACCOUNT_ERROR_USERNAME_EXISTED: 'ERROR-ACCOUNT-ERROR-0002',
  ACCOUNT_ERROR_PHONE_EXISTED: 'ERROR-ACCOUNT-ERROR-0003',
  ACCOUNT_ERROR_EMAIL_EXISTED: 'ERROR-ACCOUNT-ERROR-0004',
  ACCOUNT_ERROR_WRONG_PASSWORD: 'ERROR-ACCOUNT-ERROR-0005',
  ACCOUNT_ERROR_NEW_PASSWORD_SAME_OLD_PASSWORD: 'ERROR-ACCOUNT-ERROR-0006',
  ACCOUNT_ERROR_LOCKED: 'ERROR-ACCOUNT-ERROR-0007',
  ACCOUNT_ERROR_SOCIAL_LOGIN_FAIL: 'ERROR-ACCOUNT-ERROR-0008',

  // === Employee error code ===
  EMPLOYEE_ERROR_NOT_FOUND: 'ERROR-EMPLOYEE-ERROR-0000',
  EMPLOYEE_ERROR_USERNAME_EXISTED: 'ERROR-EMPLOYEE-ERROR-0002',
  EMPLOYEE_ERROR_PHONE_EXISTED: 'ERROR-EMPLOYEE-ERROR-0003',
  EMPLOYEE_ERROR_EMAIL_EXISTED: 'ERROR-EMPLOYEE-ERROR-0004',
  EMPLOYEE_ERROR_WRONG_PASSWORD: 'ERROR-EMPLOYEE-ERROR-0005',
  EMPLOYEE_ERROR_NEW_PASSWORD_SAME_OLD_PASSWORD: 'ERROR-EMPLOYEE-ERROR-0006',

  // === Category error code ===
  CATEGORY_ERROR_NOT_FOUND: 'ERROR-CATEGORY-ERROR-0000',
  CATEGORY_ERROR_NAME_EXISTED: 'ERROR-CATEGORY-ERROR-0002',
  CATEGORY_ERROR_HAS_MOVIE: 'ERROR-CATEGORY-ERROR-0003'
};

export const groupErrorMaps: ErrorMaps<GroupBodyType> = {
  [ErrorCode.GROUP_ERROR_NAME_EXIST]: [
    ['name', { type: 'manual', message: 'Tên nhóm đã tồn tại' }]
  ],
  [ErrorCode.GROUP_ERROR_NOT_FOUND]: [
    ['name', { type: 'manual', message: 'Tên nhóm không tồn tại' }]
  ],
  [ErrorCode.GROUP_ERROR_NOT_ALLOWED_CREATE]: [
    ['name', { type: 'manual', message: 'Bạn không có quyền tạo nhóm mới' }]
  ],
  [ErrorCode.GROUP_ERROR_NOT_ALLOWED_DELETE]: [
    ['name', { type: 'manual', message: 'Bạn không có quyền xóa nhóm này' }]
  ],
  [ErrorCode.GROUP_ERROR_KIND_EXISTED]: [
    ['kind', { type: 'manual', message: 'Loại nhóm đã tồn tại' }]
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

export const employeeErrorMaps: ErrorMaps<EmployeeBodyType> = {
  [ErrorCode.ACCOUNT_ERROR_USERNAME_EXISTED]: [
    ['username', { type: 'manual', message: 'Tên đăng nhập đã tồn tại' }]
  ],
  [ErrorCode.ACCOUNT_ERROR_PHONE_EXISTED]: [
    ['phone', { type: 'manual', message: 'Số điện thoại đã tồn tại' }]
  ],
  [ErrorCode.ACCOUNT_ERROR_EMAIL_EXISTED]: [
    ['email', { type: 'manual', message: 'Email đã tồn tại' }]
  ],
  [ErrorCode.ACCOUNT_ERROR_NEW_PASSWORD_SAME_OLD_PASSWORD]: [
    ['confirmPassword', { type: 'manual', message: 'Email đã tồn tại' }]
  ],
  [ErrorCode.ACCOUNT_ERROR_WRONG_PASSWORD]: [
    ['password', { type: 'manual', message: 'Mật khẩu không chính xác' }]
  ],
  [ErrorCode.EMPLOYEE_ERROR_USERNAME_EXISTED]: [
    ['username', { type: 'manual', message: 'Tên đăng nhập đã tồn tại' }]
  ],
  [ErrorCode.EMPLOYEE_ERROR_PHONE_EXISTED]: [
    ['phone', { type: 'manual', message: 'Số điện thoại đã tồn tại' }]
  ],
  [ErrorCode.EMPLOYEE_ERROR_EMAIL_EXISTED]: [
    ['email', { type: 'manual', message: 'Email đã tồn tại' }]
  ],
  [ErrorCode.EMPLOYEE_ERROR_NEW_PASSWORD_SAME_OLD_PASSWORD]: [
    [
      'newPassword',
      {
        type: 'manual',
        message: 'Mật khẩu mới không được trùng với mật khẩu cũ'
      }
    ]
  ],
  [ErrorCode.EMPLOYEE_ERROR_WRONG_PASSWORD]: [
    [
      'oldPassword',
      {
        type: 'manual',
        message: 'Mật khẩu cũ không chính xác'
      }
    ]
  ]
};

export const categoryErrorMaps: ErrorMaps<CategoryBodyType> = {
  [ErrorCode.CATEGORY_ERROR_NAME_EXISTED]: [
    [
      'name',
      {
        type: 'manual',
        message: 'Tên danh mục đã tồn tại'
      }
    ]
  ]
};
