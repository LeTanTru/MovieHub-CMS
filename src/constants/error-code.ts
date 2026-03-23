import type {
  AccountBodyType,
  AppVersionBodyType,
  CategoryBodyType,
  CollectionBodyType,
  CollectionItemBodyType,
  EmployeeBodyType,
  ErrorMaps,
  GroupBodyType,
  GroupPermissionBodyType,
  MovieItemBodyType,
  PermissionBodyType,
  PersonBodyType,
  ProfileBodyType,
  StyleBodyType,
  VideoLibraryBodyType
} from '@/types';

export const ErrorCode = {
  // === Group error code ===
  GROUP_ERROR_NAME_EXIST: 'ERROR-GROUP-000',
  GROUP_ERROR_NOT_FOUND: 'ERROR-GROUP-001',

  // === GroupPermission error code ===
  GROUP_PERMISSION_ERROR_NOT_FOUND: 'ERROR-GROUP-PERMISSION-000',
  GROUP_PERMISSION_ERROR_NAME_EXIST: 'ERROR-GROUP-PERMISSION-001',

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
  ACCOUNT_ERROR_SOCIAL_LOGIN_FAIL: 'ERROR-ACCOUNT-ERROR-0008',
  ACCOUNT_ERROR_NOT_DELETE_SUPPER_ADMIN: 'ERROR-ACCOUNT-00014',
  ACCOUNT_ERROR_EMAIL_EXIST: 'ERROR-ACCOUNT-00015',
  ACCOUNT_ERROR_PHONE_EXIST: 'ERROR-ACCOUNT-00016',
  ACCOUNT_ERROR_NEW_PASSWORD_SAME_OLD_PASSWORD: 'ERROR-ACCOUNT-00017',

  USER_ERROR_NOT_FOUND: 'ERROR-USER-ERROR-0000',
  USER_ERROR_USERNAME_EXIST: 'ERROR-USER-ERROR-0002',
  USER_ERROR_PHONE_EXIST: 'ERROR-USER-ERROR-0003',
  USER_ERROR_EMAIL_EXIST: 'ERROR-USER-ERROR-0004',
  USER_ERROR_WRONG_PASSWORD: 'ERROR-USER-ERROR-0005',
  USER_ERROR_NEW_PASSWORD_SAME_OLD_PASSWORD: 'ERROR-USER-ERROR-0006',
  USER_ERROR_OTP_INVALID: 'ERROR-USER-ERROR-0007',
  USER_ERROR_RESEND_OTP_LIMIT: 'ERROR-USER-ERROR-0008',
  USER_ERROR_CONFIRM_PASSWORD_INVALID: 'ERROR-USER-ERROR-0009',

  // === Employee error code ===
  EMPLOYEE_ERROR_NOT_FOUND: 'ERROR-EMPLOYEE-ERROR-0000',
  EMPLOYEE_ERROR_USERNAME_EXIST: 'ERROR-EMPLOYEE-ERROR-0002',
  EMPLOYEE_ERROR_PHONE_EXIST: 'ERROR-EMPLOYEE-ERROR-0003',
  EMPLOYEE_ERROR_EMAIL_EXIST: 'ERROR-EMPLOYEE-ERROR-0004',
  EMPLOYEE_ERROR_WRONG_PASSWORD: 'ERROR-EMPLOYEE-ERROR-0005',
  EMPLOYEE_ERROR_NEW_PASSWORD_SAME_OLD_PASSWORD: 'ERROR-EMPLOYEE-ERROR-0006',

  // === Category error code ===
  CATEGORY_ERROR_NOT_FOUND: 'ERROR-CATEGORY-ERROR-0000',
  CATEGORY_ERROR_NAME_EXIST: 'ERROR-CATEGORY-ERROR-0002',
  CATEGORY_ERROR_HAS_MOVIE: 'ERROR-CATEGORY-ERROR-0003',

  // === Person error code ===
  PERSON_ERROR_NOT_FOUND: 'ERROR-PERSON-ERROR-0000',
  PERSON_ERROR_MOVIE_PERSON_EXIST: 'ERROR-PERSON-ERROR-0001',
  PERSON_ERROR_NOT_HAVE_KIND: 'ERROR-PERSON-ERROR-0002',

  // === Video error code ===
  VIDEO_LIBRARY_ERROR_NOT_FOUND: 'ERROR-VIDEO-LIBRARY-ERROR-0000',
  VIDEO_LIBRARY_ERROR_NAME_EXIST: 'ERROR-VIDEO-LIBRARY-ERROR-0002',
  VIDEO_LIBRARY_ERROR_MOVIE_ITEM_EXIST: 'ERROR-VIDEO-LIBRARY-ERROR-0003',

  // === Movie error code ===
  MOVIE_ERROR_NOT_FOUND: 'ERROR-MOVIE-ERROR-0000',
  MOVIE_ERROR_SLUG_EXIST: 'ERROR-MOVIE-ERROR-0002',
  MOVIE_ERROR_HAS_ITEM: 'ERROR-MOVIE-ERROR-0003',

  // === Movie item error code ===
  MOVIE_ITEM_ERROR_NOT_FOUND: 'ERROR-MOVIE-ITEM-ERROR-0000',
  MOVIE_ITEM_ERROR_PARENT_REQUIRED: 'ERROR-MOVIE-ITEM-ERROR-0002',
  MOVIE_ITEM_ERROR_VIDEO_REQUIRED: 'ERROR-MOVIE-ITEM-ERROR-0003',
  MOVIE_ITEM_ERROR_KIND_INVALID: 'ERROR-MOVIE-ITEM-ERROR-0004',
  MOVIE_ITEM_ERROR_INVALID_REQUEST: 'ERROR-MOVIE-ITEM-ERROR-0005',
  MOVIE_ITEM_ERROR_LABEL_EXIST: 'ERROR-MOVIE-ITEM-ERROR-0006',

  // === App version error code ===
  APP_VERSION_ERROR_NOT_FOUND: 'ERROR-APP-VERSION-0000',
  APP_VERSION_ERROR_NAME_EXIST: 'ERROR-APP-VERSION-0001',
  APP_VERSION_ERROR_NOT_HAVE_LATEST_VERSION: 'ERROR-APP-VERSION-0002',

  // === Style error code ===
  STYLE_ERROR_NOT_FOUND: 'ERROR-STYLE-0000',
  STYLE_ERROR_TYPE_EXIST: 'ERROR-STYLE-0001',
  STYLE_ERROR_TYPE_NOT_HAVE_DEFAULT: 'ERROR-STYLE-0002',

  // === Collection error code ===
  COLLECTION_ERROR_NOT_FOUND: 'ERROR-COLLECTION-0000',
  COLLECTION_ERROR_NAME_EXIST: 'ERROR-COLLECTION-0001',

  // === Collection item error code ===
  COLLECTION_ITEM_ERROR_NOT_FOUND: 'ERROR-COLLECTION-ITEM-0000',
  COLLECTION_ITEM_ERROR_MOVIE_EXIST: 'ERROR-COLLECTION-ITEM-0001',
  COLLECTION_ITEM_ERROR_MAX_ITEM: 'ERROR-COLLECTION-ITEM-0002'
};

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

export const adminErrorMaps: ErrorMaps<AccountBodyType> = {
  [ErrorCode.ACCOUNT_ERROR_USERNAME_EXIST]: [
    ['username', { type: 'manual', message: 'Tên đăng nhập đã tồn tại' }]
  ],
  [ErrorCode.ACCOUNT_ERROR_WRONG_PASSWORD]: [
    ['password', { type: 'manual', message: 'Mật khẩu không đúng' }]
  ],
  [ErrorCode.ACCOUNT_ERROR_EMAIL_EXIST]: [
    ['email', { type: 'manual', message: 'Email đã tồn tại' }]
  ],
  [ErrorCode.ACCOUNT_ERROR_PHONE_EXIST]: [
    ['phone', { type: 'manual', message: 'Số điện thoại đã tồn tại' }]
  ]
};

export const employeeErrorMaps: ErrorMaps<EmployeeBodyType> = {
  [ErrorCode.ACCOUNT_ERROR_USERNAME_EXIST]: [
    ['username', { type: 'manual', message: 'Tên đăng nhập đã tồn tại' }]
  ],
  [ErrorCode.ACCOUNT_ERROR_PHONE_EXIST]: [
    ['phone', { type: 'manual', message: 'Số điện thoại đã tồn tại' }]
  ],
  [ErrorCode.ACCOUNT_ERROR_EMAIL_EXIST]: [
    ['email', { type: 'manual', message: 'Email đã tồn tại' }]
  ],
  [ErrorCode.ACCOUNT_ERROR_NEW_PASSWORD_SAME_OLD_PASSWORD]: [
    ['confirmPassword', { type: 'manual', message: 'Email đã tồn tại' }]
  ],
  [ErrorCode.ACCOUNT_ERROR_WRONG_PASSWORD]: [
    ['password', { type: 'manual', message: 'Mật khẩu không chính xác' }]
  ],
  [ErrorCode.EMPLOYEE_ERROR_USERNAME_EXIST]: [
    ['username', { type: 'manual', message: 'Tên đăng nhập đã tồn tại' }]
  ],
  [ErrorCode.EMPLOYEE_ERROR_PHONE_EXIST]: [
    ['phone', { type: 'manual', message: 'Số điện thoại đã tồn tại' }]
  ],
  [ErrorCode.EMPLOYEE_ERROR_EMAIL_EXIST]: [
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
  ]
};

export const categoryErrorMaps: ErrorMaps<CategoryBodyType> = {
  [ErrorCode.CATEGORY_ERROR_NAME_EXIST]: [
    [
      'name',
      {
        type: 'manual',
        message: 'Tên thể loại đã tồn tại'
      }
    ]
  ]
};

export const personErrorMaps: ErrorMaps<PersonBodyType> = {};

export const movieItemErrorMaps: ErrorMaps<MovieItemBodyType> = {
  [ErrorCode.MOVIE_ITEM_ERROR_PARENT_REQUIRED]: [
    [
      'parentId',
      {
        type: 'manual',
        message: 'Vui lòng chọn phần để thêm'
      }
    ]
  ],
  [ErrorCode.MOVIE_ITEM_ERROR_LABEL_EXIST]: [
    ['label', { type: 'manual', message: 'Nhãn đã tồn tại' }]
  ]
};

export const videoLibraryErrorMaps: ErrorMaps<VideoLibraryBodyType> = {
  [ErrorCode.VIDEO_LIBRARY_ERROR_NAME_EXIST]: [
    [
      'name',
      {
        type: 'manual',
        message: 'Tên video đã tồn tại'
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
      'password',
      {
        type: 'manual',
        message: 'Mật khẩu mới không được giống với mật khẩu hiện tại'
      }
    ]
  ]
};

export const appVersionErrorMaps: ErrorMaps<AppVersionBodyType> = {
  [ErrorCode.APP_VERSION_ERROR_NAME_EXIST]: [
    ['name', { type: 'manual', message: 'Tên phiên bản đã tồn tại' }]
  ]
};

export const styleErrorMaps: ErrorMaps<StyleBodyType> = {
  [ErrorCode.STYLE_ERROR_TYPE_EXIST]: [
    ['type', { type: 'manual', message: 'Loại thiết kế đã tồn tại' }]
  ]
};

export const collectionErrorMaps: ErrorMaps<CollectionBodyType> = {
  [ErrorCode.COLLECTION_ERROR_NAME_EXIST]: [
    ['name', { type: 'manual', message: 'Tên bộ sưu tập đã tồn tại' }]
  ]
};

export const collectionItemErrorMaps: ErrorMaps<CollectionItemBodyType> = {
  [ErrorCode.COLLECTION_ITEM_ERROR_MOVIE_EXIST]: [
    [
      'movieId',
      { type: 'manual', message: 'Phim này đã tồn tại trong bộ sưu tập' }
    ]
  ]
};
