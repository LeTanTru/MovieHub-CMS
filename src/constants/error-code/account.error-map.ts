import type {
  AccountBodyType,
  EmployeeBodyType,
  ErrorMaps,
  ProfileBodyType
} from '@/types';
import { ErrorCode } from './error-code';

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
    [
      'confirmPassword',
      {
        type: 'manual',
        message: 'Mật khẩu mới không được trùng với mật khẩu cũ'
      }
    ]
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
