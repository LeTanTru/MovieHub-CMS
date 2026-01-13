import type { ApiConfig } from '@/types/api.type';
import type { ReactNode } from 'react';
import type { FieldValues } from 'react-hook-form';
import type { ZodObject } from 'zod';

export type BaseSearchType = {
  id?: string;
  page?: number;
  size?: number;
};

export type AutoCompleteOption = {
  label: string;
  value: string | number;
  prefix?: ReactNode;
};

export type OptionType<V = string | number> = {
  label: string;
  value: V;
  color?: string;
};

export type SearchFormProps<S extends FieldValues> = {
  searchFields: {
    key: keyof S | number[];
    type?: string;
    colSpan?: number;
    placeholder: string;
    options?: OptionType[];
    submitOnChanged?: boolean;
    apiConfig?: ApiConfig;
    mappingData?: (option: any) => AutoCompleteOption;
    searchParams?: string[];
    initialParams?: Record<string, any>;
    dateFormat?: string;
  }[];
  initialValues: Partial<S>;
  schema: ZodObject;
  handleSearchSubmit: (values: any) => void;
  handleSearchReset: () => void;
};
