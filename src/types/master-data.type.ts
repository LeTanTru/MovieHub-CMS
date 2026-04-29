import { FieldTypes } from '@/constants';

export type FieldType = keyof typeof FieldTypes;

export type OptionType = {
  value: string | number;
  label: string;
  [key: string]: string | number;
};
