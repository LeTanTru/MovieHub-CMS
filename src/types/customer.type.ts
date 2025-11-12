import {
  customerSchema,
  customerSearchSchema
} from '@/schemaValidations/customer.schema';
import { BaseSearchType } from '@/types/search.type';
import z from 'zod';

export type CustomerResType = {
  id: string;
  status: number;
  account: {
    id: string;
    kind: number;
    username: string;
    phone: string;
    email: string;
    fullName: string;
    avatarPath: string;
    isSuperAdmin: boolean;
  };
  logoPath: string;
};

export type CustomerSearchType = z.infer<typeof customerSearchSchema> &
  BaseSearchType;

export type ChangeStatusCustomerBodyType = {
  id: string;
  status: number;
};

export type CustomerBodyType = z.infer<typeof customerSchema>;
