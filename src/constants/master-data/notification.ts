import {
  NOTIFICATION_TYPE_COMMUNITY,
  NOTIFICATION_TYPE_SYSTEM
} from '@/constants/constant';
import { OptionType } from '@/types';

export const notificationOtions = [
  {
    value: NOTIFICATION_TYPE_SYSTEM,
    label: 'Hệ thống'
  },
  {
    value: NOTIFICATION_TYPE_COMMUNITY,
    label: 'Cộng đồng'
  }
];

export const notificationTabs: OptionType[] = [
  {
    value: NOTIFICATION_TYPE_SYSTEM,
    label: 'Hệ thống'
  },
  {
    value: NOTIFICATION_TYPE_COMMUNITY,
    label: 'Cộng đồng'
  }
];
