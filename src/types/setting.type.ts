import { settingSchema, settingSearchSchema } from '@/schema-validations';
import type { BaseSearchType } from '@/types/search.type';
import { z } from 'zod';

export type SettingResType = {
  createdDate: string;
  dataType: string;
  description: string;
  groupName: string;
  id: string;
  isSystem: boolean;
  keyName: string;
  modifiedDate: string;
  options: string;
  status: number;
  valueData: string;
};

export type SettingBodyType = z.infer<typeof settingSchema>;

export type SettingSearchType = z.infer<typeof settingSearchSchema> &
  BaseSearchType;

export type PublicSettingResType = {
  id: string;
  groupName: string;
  description: string;
  keyName: string;
  valueData: string;
};
