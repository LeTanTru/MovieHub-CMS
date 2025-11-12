import {
  GENDER_FEMALE,
  GENDER_MALE,
  GENDER_OTHER,
  GROUP_KIND_ADMIN,
  GROUP_KIND_COMPANY,
  GROUP_KIND_EMPLOYEE,
  GROUP_KIND_INTERNAL,
  GROUP_KIND_MANAGER,
  GROUP_KIND_USER,
  GROUP_KIND_USER_VIP,
  LOGIN_TYPE_EMPLOYEE,
  LOGIN_TYPE_MANAGER,
  STATUS_ACTIVE,
  STATUS_DELETED,
  STATUS_LOCK,
  STATUS_PENDING,
  UPLOAD_AVATAR,
  UPLOAD_LOGO
} from '@/constants/constant';

export const uploadOptions = {
  LOGO: UPLOAD_LOGO,
  AVATAR: UPLOAD_AVATAR
};

export const groupKinds = [
  {
    label: 'ADMIN',
    value: GROUP_KIND_ADMIN,
    color: '#EF4444'
  },
  {
    label: 'MANAGER',
    value: GROUP_KIND_MANAGER,
    color: '#F59E0B'
  },
  {
    label: 'EMPLOYEE',
    value: GROUP_KIND_EMPLOYEE,
    color: '#3B82F6'
  },
  {
    label: 'INTERNAL',
    value: GROUP_KIND_INTERNAL,
    color: '#8B5CF6'
  },
  {
    label: 'COMPANY',
    value: GROUP_KIND_COMPANY,
    color: '#6366F1'
  },
  {
    label: 'USER',
    value: GROUP_KIND_USER,
    color: '#10B981'
  },
  {
    label: 'USER VIP',
    value: GROUP_KIND_USER_VIP,
    color: '#D946EF'
  }
];

export const statusOptions = [
  {
    value: STATUS_ACTIVE,
    label: 'Hoạt động',
    color: '#28a745'
  },
  {
    value: STATUS_PENDING,
    label: 'Đang chờ',
    color: '#ffc107'
  },
  {
    value: STATUS_LOCK,
    label: 'Khóa',
    color: '#dc3545'
  },
  {
    value: STATUS_DELETED,
    label: 'Đã xóa',
    color: '#dc3545'
  }
];

export const FieldTypes = {
  STRING: 'STRING_TYPE',
  NUMBER: 'NUMBER_TYPE',
  SELECT: 'SELECT',
  AUTOCOMPLETE: 'AUTOCOMPLETE',
  DATE: 'DATE',
  DATE_RANGE: 'DATE_RANGE'
} as const;

export type FieldType = keyof typeof FieldTypes;

export type OptionType = {
  value: string | number;
  label: string;
  [key: string]: string | number;
};

export const genderOptions: OptionType[] = [
  { value: GENDER_MALE, label: 'Nam' },
  { value: GENDER_FEMALE, label: 'Nữ' },
  { value: GENDER_OTHER, label: 'Khác' }
];

export const queryKeys = {
  LOGIN: 'login',
  ACCOUNT: 'account',
  GROUP: 'group',
  CUSTOMER: 'customer',
  GROUP_PERMISSION: 'group-permission',
  BUSINESS: 'business',
  DB_CONFIG: 'db_config',
  SERVER_PROVIDER: 'server_provider',
  SNS_CONFIG: 'sns_config'
};

export const languageOptions = [
  {
    label: 'Tiếng Việt',
    value: 'vi'
  },
  {
    label: 'Tiếng Anh',
    value: 'en'
  }
];

export const loginOptions = [
  {
    label: 'Quản lý',
    value: LOGIN_TYPE_MANAGER
  },
  {
    label: 'Nhân viên',
    value: LOGIN_TYPE_EMPLOYEE
  }
];
