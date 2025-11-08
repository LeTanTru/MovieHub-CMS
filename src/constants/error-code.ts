import {
  AccountBodyType,
  BusinessBodyType,
  CustomerBodyType,
  DbConfigBodyType,
  ErrorMaps,
  GroupBodyType,
  PermissionBodyType,
  ServerProviderBodyType
} from '@/types';
import { GroupPermissionBodyType } from '@/types/group-permission.type';

export const ErrorCode = {
  // === General error code ===
  GENERAL_ERROR_REQUIRE_PARAMS: 'ERROR-GENERAL-0000',
  GENERAL_ERROR_STORE_LOCKED: 'ERROR-GENERAL-0001',
  GENERAL_ERROR_ACCOUNT_LOCKED: 'ERROR-GENERAL-0002',
  GENERAL_ERROR_SHOP_LOCKED: 'ERROR-GENERAL-0003',
  GENERAL_ERROR_STORE_NOT_FOUND: 'ERROR-GENERAL-0004',
  GENERAL_ERROR_ACCOUNT_NOT_FOUND: 'ERROR-GENERAL-0005',

  // === DB config error code ===
  DB_CONFIG_ERROR_UNAUTHORIZED: 'ERROR-DB-CONFIG-000',
  DB_CONFIG_ERROR_NOT_FOUND: 'ERROR-DB-CONFIG-001',
  DB_CONFIG_ERROR_NOT_INITIALIZE: 'ERROR-DB-CONFIG-002',
  DB_CONFIG_ERROR_CANNOT_CREATE_DB: 'ERROR-DB-CONFIG-003',
  DB_CONFIG_ERROR_CANNOT_RESTORE_DB: 'ERROR-DB-CONFIG-004',
  DB_CONFIG_ERROR_UPLOAD: 'ERROR-DB-RESTORE-005',
  DB_CONFIG_UPGRADE_TENANT_ALREADY_IN_PROCESS: 'ERROR-DB-CONFIG-006',
  DB_CONFIG_ERROR_DROP: 'ERROR-DB-CONFIG-007',
  DB_CONFIG_SHOP_EXISTED: 'ERROR-DB-CONFIG-008',
  DB_CONFIG_USER_NAME_EXISTED: 'ERROR-DB-CONFIG-009',

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

  // === Account error code ===
  ACCOUNT_ERROR_UNKNOWN: 'ERROR-ACCOUNT-0000',
  ACCOUNT_ERROR_USERNAME_EXIST: 'ERROR-ACCOUNT-0001',
  ACCOUNT_ERROR_NOT_FOUND: 'ERROR-ACCOUNT-0002',
  ACCOUNT_ERROR_WRONG_PASSWORD: 'ERROR-ACCOUNT-0003',
  ACCOUNT_ERROR_WRONG_HASH_RESET_PASS: 'ERROR-ACCOUNT-0004',
  ACCOUNT_ERROR_LOCKED: 'ERROR-ACCOUNT-0005',
  ACCOUNT_ERROR_OPT_INVALID: 'ERROR-ACCOUNT-0006',
  ACCOUNT_ERROR_LOGIN: 'ERROR-ACCOUNT-0007',
  ACCOUNT_ERROR_MERCHANT_LOGIN_ERROR_DEVICE: 'ERROR-ACCOUNT-0008',
  ACCOUNT_ERROR_MERCHANT_LOGIN_ERROR_STORE: 'ERROR-ACCOUNT-0009',
  ACCOUNT_ERROR_MERCHANT_LOGIN_WRONG_STORE: 'ERROR-ACCOUNT-0010',
  ACCOUNT_ERROR_MERCHANT_SERVICE_NOT_REGISTER: 'ERROR-ACCOUNT-0011',
  ACCOUNT_ERROR_ACCOUNT_IS_EMPLOYEE: 'ERROR-ACCOUNT-0012',
  ACCOUNT_ERROR_ACCOUNT_IS_NOT_MANAGER: 'ERROR-ACCOUNT-0013',
  ACCOUNT_ERROR_NOT_DELETE_SUPPER_ADMIN: 'ERROR-ACCOUNT-00014',
  ACCOUNT_ERROR_EMAIL_EXISTED: 'ERROR-ACCOUNT-00015',
  ACCOUNT_ERROR_PHONE_EXISTED: 'ERROR-ACCOUNT-00016',
  ACCOUNT_ERROR_NEW_PASSWORD_SAME_OLD_PASSWORD: 'ERROR-ACCOUNT-00017',

  // === Auth token error code ===
  AUTH_TOKEN_ERROR_UNKNOWN: 'ERROR-AUTH-TOKEN-0000',
  AUTH_TOKEN_ERROR_WRONG_SHOP: 'ERROR-AUTH-TOKEN-0001',
  AUTH_TOKEN_ERROR_NOT_FOUND: 'ERROR-AUTH-TOKEN-0002',
  AUTH_TOKEN_ERROR_INVALID: 'ERROR-AUTH-TOKEN-0003',
  AUTH_TOKEN_ERROR_INVALID_STORE: 'ERROR-AUTH-TOKEN-0004',
  AUTH_TOKEN_ERROR_INVALID_DEVICE: 'ERROR-AUTH-TOKEN-0005',

  // === Customer error code ===
  CUSTOMER_ERROR_UNKNOWN: 'ERROR-CUSTOMER-0000',
  CUSTOMER_ERROR_BUSINESS_EXISTED: 'ERROR-CUSTOMER-0001',
  CUSTOMER_ERROR_EXIST: 'ERROR-CUSTOMER-0002',
  CUSTOMER_ERROR_UPDATE: 'ERROR-CUSTOMER-0003',
  CUSTOMER_ERROR_NOT_FOUND: 'ERROR-CUSTOMER-0004',
  CUSTOMER_ERROR_NOT_ACTIVE: 'ERROR-CUSTOMER-0005',

  // === Shop account error code ===
  SHOP_ACCOUNT_ERROR_UNKNOWN: 'ERROR-SHOP_ACCOUNT-0000',

  // === Server provider error code ===
  SERVER_PROVIDER_ERROR_UNAUTHORIZED: 'ERROR-SERVER-PROVIDER-000',
  SERVER_PROVIDER_ERROR_NOT_FOUND: 'ERROR-SERVER-PROVIDER-001',
  SERVER_PROVIDER_ERROR_URL_EXISTED: 'ERROR-SERVER-PROVIDER-002',
  SERVER_PROVIDER_ERROR_NOT_ANY_VALID: 'ERROR-SERVER-PROVIDER-003',
  SERVER_PROVIDER_MAX_TENANT_REACHED: 'ERROR-SERVER-PROVIDER-004',

  // === Business error code ===
  BUSINESS_ERROR_NOT_OWNER: 'ERROR-BUSINESS-0000',
  BUSINESS_ERROR_NOT_FOUND: 'ERROR-BUSINESS-0001',
  BUSINESS_ERROR_UN_AUTHORIZE: 'ERROR-BUSINESS-0002',
  BUSINESS_ERROR_NOT_ACTIVE: 'ERROR-BUSINESS-0003',
  BUSINESS_ERROR_EXPIRED: 'ERROR-BUSINESS-0004',
  BUSINESS_ERROR_TENANT_ID_EXIST: 'ERROR-BUSINESS-0005',

  // === GroupPermission error code ===
  GROUP_PERMISSION_ERROR_NOT_FOUND: 'ERROR-GROUP-PERMISSION-000',
  GROUP_PERMISSION_ERROR_NAME_EXIST: 'ERROR-GROUP-PERMISSION-001'
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

export const adminErrorMaps: ErrorMaps<AccountBodyType> = {
  [ErrorCode.ACCOUNT_ERROR_UNKNOWN]: [
    ['username', { type: 'manual', message: 'Lỗi không xác định' }]
  ],
  [ErrorCode.ACCOUNT_ERROR_USERNAME_EXIST]: [
    ['username', { type: 'manual', message: 'Tên đăng nhập đã tồn tại' }]
  ],
  [ErrorCode.ACCOUNT_ERROR_WRONG_PASSWORD]: [
    ['password', { type: 'manual', message: 'Mật khẩu không đúng' }]
  ],
  [ErrorCode.ACCOUNT_ERROR_EMAIL_EXISTED]: [
    ['email', { type: 'manual', message: 'Email đã tồn tại' }]
  ],
  [ErrorCode.ACCOUNT_ERROR_PHONE_EXISTED]: [
    ['phone', { type: 'manual', message: 'Số điện thoại đã tồn tại' }]
  ]
};

export const customerErrorMaps: ErrorMaps<CustomerBodyType> = {
  [ErrorCode.ACCOUNT_ERROR_UNKNOWN]: [
    ['username', { type: 'manual', message: 'Lỗi không xác định' }]
  ],
  [ErrorCode.ACCOUNT_ERROR_USERNAME_EXIST]: [
    ['username', { type: 'manual', message: 'Tên đăng nhập đã tồn tại' }]
  ],
  [ErrorCode.ACCOUNT_ERROR_WRONG_PASSWORD]: [
    ['password', { type: 'manual', message: 'Mật khẩu không đúng' }]
  ],
  [ErrorCode.ACCOUNT_ERROR_EMAIL_EXISTED]: [
    ['email', { type: 'manual', message: 'Email đã tồn tại' }]
  ],
  [ErrorCode.ACCOUNT_ERROR_PHONE_EXISTED]: [
    ['phone', { type: 'manual', message: 'Số điện thoại đã tồn tại' }]
  ],
  [ErrorCode.ACCOUNT_ERROR_NEW_PASSWORD_SAME_OLD_PASSWORD]: [
    [
      'newPassword',
      {
        type: 'manual',
        message: 'Mật khẩu mới không được trùng với mật khẩu cũ'
      }
    ]
  ]
};

export const customerBusinessErrorMaps: ErrorMaps<BusinessBodyType> = {
  [ErrorCode.BUSINESS_ERROR_NOT_OWNER]: [
    ['tenantId', { type: 'manual', message: 'Mã thuê bao đã tồn tại' }]
  ]
};

export const dbConfigErrorMaps: ErrorMaps<DbConfigBodyType> = {};

export const serverProviderErrorMaps: ErrorMaps<ServerProviderBodyType> = {
  [ErrorCode.SERVER_PROVIDER_ERROR_URL_EXISTED]: [
    ['url', { type: 'manual', message: 'Url đã tồn tại' }]
  ],
  [ErrorCode.SERVER_PROVIDER_MAX_TENANT_REACHED]: [
    [
      'maxTenant',
      {
        type: 'manual',
        message: 'Số lượng đã đạt tối đa, không thể dùng máy chủ này'
      }
    ]
  ]
};

/* 
  SERVER_PROVIDER_ERROR_UNAUTHORIZED: 'ERROR-SERVER-PROVIDER-000',
  SERVER_PROVIDER_ERROR_NOT_FOUND: 'ERROR-SERVER-PROVIDER-001',
  SERVER_PROVIDER_ERROR_URL_EXISTED: 'ERROR-SERVER-PROVIDER-002',
  SERVER_PROVIDER_ERROR_NOT_ANY_VALID: 'ERROR-SERVER-PROVIDER-003',
  SERVER_PROVIDER_MAX_TENANT_REACHED: 'ERROR-SERVER-PROVIDER-004',
*/
