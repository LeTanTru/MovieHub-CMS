import {
  COLOR_STATUS_ACTIVE,
  COLOR_STATUS_ERROR,
  COLOR_STATUS_PENDING,
  STATUS_ACTIVE,
  STATUS_DELETED,
  STATUS_LOCK,
  STATUS_PENDING
} from '@/constants/constant';

export const statusOptions = [
  {
    value: STATUS_ACTIVE,
    label: 'Hoạt động',
    color: COLOR_STATUS_ACTIVE
  },
  {
    value: STATUS_PENDING,
    label: 'Đang chờ',
    color: COLOR_STATUS_PENDING
  },
  {
    value: STATUS_LOCK,
    label: 'Khóa',
    color: COLOR_STATUS_ERROR
  },
  {
    value: STATUS_DELETED,
    label: 'Đã xóa',
    color: COLOR_STATUS_ERROR
  }
];

export const employeeStatusOptions = [
  {
    value: STATUS_ACTIVE,
    label: 'Hoạt động',
    color: COLOR_STATUS_ACTIVE
  },
  {
    value: STATUS_LOCK,
    label: 'Khóa',
    color: COLOR_STATUS_ERROR
  }
];

export const movieStatusOptions = [
  {
    label: 'Hoạt động',
    value: STATUS_ACTIVE,
    color: COLOR_STATUS_ACTIVE
  },
  {
    label: 'Đang chờ',
    value: STATUS_PENDING,
    color: COLOR_STATUS_PENDING
  }
];

export const serverConfigStatusOptions = [
  {
    value: STATUS_ACTIVE,
    label: 'Hoạt động',
    color: COLOR_STATUS_ACTIVE
  },
  {
    value: STATUS_LOCK,
    label: 'Khóa',
    color: COLOR_STATUS_ERROR
  },
  {
    value: STATUS_PENDING,
    label: 'Đang chờ',
    color: COLOR_STATUS_PENDING
  }
];
