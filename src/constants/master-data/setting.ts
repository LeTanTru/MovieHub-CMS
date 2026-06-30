import {
  SEND_NOTIFICATION_FOR_ALL_USERS,
  SEND_NOTIFICATION_FOR_INTERESTED_USERS
} from '@/constants/constant';

export const settingDataTypes = [
  {
    label: 'Integer',
    value: 'Integer'
  },
  {
    label: 'String',
    value: 'String'
  },
  {
    label: 'Boolean',
    value: 'Boolean'
  },
  {
    label: 'Double',
    value: 'Double'
  },
  {
    label: 'RichText',
    value: 'RichText'
  },
  {
    label: 'Select',
    value: 'Select'
  },
  {
    label: 'Upload',
    value: 'Upload'
  },
  {
    label: 'List',
    value: 'List'
  }
];

export const sendForOptions = [
  { value: SEND_NOTIFICATION_FOR_ALL_USERS, label: 'Tất cả người dùng' },
  {
    value: SEND_NOTIFICATION_FOR_INTERESTED_USERS,
    label: 'Người dùng quan tâm'
  }
];
