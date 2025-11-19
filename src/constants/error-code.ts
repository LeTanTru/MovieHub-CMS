import {
  CategoryBodyType,
  EmployeeBodyType,
  ErrorMaps,
  GroupBodyType,
  PermissionBodyType,
  PersonBodyType,
  ProfileBodyType,
  VideoLibraryBodyType
} from '@/types';

export const ErrorCode = {
  // === Group error code ===
  GROUP_ERROR_NAME_EXIST: 'ERROR-GROUP-ERROR-0002',
  GROUP_ERROR_NOT_FOUND: 'ERROR-GROUP-ERROR-0001',

  // === Permission error code ===
  PERMISSION_ERROR_NAME_EXIST: 'ERROR-PERMISSION-000',
  PERMISSION_ERROR_CODE_EXIST: 'ERROR-PERMISSION-001',
  PERMISSION_ERROR_NOT_FOUND: 'ERROR-PERMISSION-002',

  // === Account error code ===
  ACCOUNT_ERROR_NOT_FOUND: 'ERROR-ACCOUNT-ERROR-0000',
  ACCOUNT_ERROR_USERNAME_EXISTED: 'ERROR-ACCOUNT-ERROR-0002',
  ACCOUNT_ERROR_PHONE_EXISTED: 'ERROR-ACCOUNT-ERROR-0003',
  ACCOUNT_ERROR_EMAIL_EXISTED: 'ERROR-ACCOUNT-ERROR-0004',
  ACCOUNT_ERROR_WRONG_PASSWORD: 'ERROR-ACCOUNT-0003',
  ACCOUNT_ERROR_NEW_PASSWORD_SAME_OLD_PASSWORD: 'ERROR-ACCOUNT-00017',
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
  CATEGORY_ERROR_HAS_MOVIE: 'ERROR-CATEGORY-ERROR-0003',

  // === Person error code ===
  PERSON_ERROR_NOT_FOUND: 'ERROR-PERSON-ERROR-0000',
  PERSON_ERROR_MOVIE_PERSON_EXISTED: 'ERROR-PERSON-ERROR-0001',
  PERSON_ERROR_NOT_HAVE_KIND: 'ERROR-PERSON-ERROR-0002',

  // === Video error code ===
  VIDEO_LIBRARY_ERROR_NOT_FOUND: 'ERROR-VIDEO-LIBRARY-ERROR-0000',
  VIDEO_LIBRARY_ERROR_NAME_EXISTED: 'ERROR-VIDEO-LIBRARY-ERROR-0002',
  VIDEO_LIBRARY_ERROR_MOVIE_ITEM_EXISTED: 'ERROR-VIDEO-LIBRARY-ERROR-0003',

  // === Movie error code ===
  MOVIE_ERROR_NOT_FOUND: 'ERROR-MOVIE-ERROR-0000',
  MOVIE_ERROR_SLUG_EXISTED: 'ERROR-MOVIE-ERROR-0002',
  MOVIE_ERROR_HAS_ITEM: 'ERROR-MOVIE-ERROR-0003',

  // === Movie item error code ===
  MOVIE_ITEM_ERROR_NOT_FOUND: 'ERROR-MOVIE-ITEM-ERROR-0000',
  MOVIE_ITEM_ERROR_PARENT_REQUIRED: 'ERROR-MOVIE-ITEM-ERROR-0002',
  MOVIE_ITEM_ERROR_VIDEO_REQUIRED: 'ERROR-MOVIE-ITEM-ERROR-0003',
  MOVIE_ITEM_ERROR_KIND_INVALID: 'ERROR-MOVIE-ITEM-ERROR-0004',
  MOVIE_ITEM_ERROR_INVALID_REQUEST: 'ERROR-MOVIE-ITEM-ERROR-0005'
};

export const groupErrorMaps: ErrorMaps<GroupBodyType> = {
  [ErrorCode.GROUP_ERROR_NAME_EXIST]: [
    ['name', { type: 'manual', message: 'Tên nhóm đã tồn tại' }]
  ],
  [ErrorCode.GROUP_ERROR_NOT_FOUND]: [
    ['name', { type: 'manual', message: 'Tên nhóm không tồn tại' }]
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

export const personErrorMaps: ErrorMaps<PersonBodyType> = {};

export const videoLibraryErrorMaps: ErrorMaps<VideoLibraryBodyType> = {
  [ErrorCode.VIDEO_LIBRARY_ERROR_NAME_EXISTED]: [
    [
      'name',
      {
        type: 'manual',
        message: 'Tên danh mục đã tồn tại'
      }
    ]
  ]
};

export const profileErrorMaps: ErrorMaps<ProfileBodyType> = {
  [ErrorCode.ACCOUNT_ERROR_WRONG_PASSWORD]: [
    ['oldPassword', { type: 'manual', message: 'Mật khẩu không chính xác' }]
  ],
  [ErrorCode.ACCOUNT_ERROR_NEW_PASSWORD_SAME_OLD_PASSWORD]: [
    [
      'newPassword',
      {
        type: 'manual',
        message: 'Mật khẩu mới không được giống với mật khẩu hiện tại'
      }
    ]
  ]
};
