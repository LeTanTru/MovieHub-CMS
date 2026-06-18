import {
  GENDER_FEMALE,
  GENDER_MALE,
  GENDER_OTHER,
  GROUP_KIND_ADMIN,
  GROUP_KIND_EMPLOYEE,
  GROUP_KIND_USER
} from '@/constants/constant';
import { OptionType } from '@/types';

export const groupKinds = [
  {
    label: 'ADMIN',
    value: GROUP_KIND_ADMIN,
    color: '#EF4444'
  },
  {
    label: 'EMPLOYEE',
    value: GROUP_KIND_EMPLOYEE,
    color: '#3B82F6'
  },
  {
    label: 'USER',
    value: GROUP_KIND_USER,
    color: '#10B981'
  }
];

export const genderOptions: OptionType[] = [
  { value: GENDER_MALE, label: 'Nam' },
  { value: GENDER_FEMALE, label: 'Nữ' },
  { value: GENDER_OTHER, label: 'Khác' }
];

export const userKindOptions = [
  {
    label: 'Người dùng',
    value: GROUP_KIND_USER
  }
];
