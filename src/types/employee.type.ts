import {
  employeeProfileSchema,
  employeeSchema,
  employeeSearchSchema
} from '@/schemaValidations';
import { BaseSearchType } from '@/types/search.type';
import z from 'zod';

export type EmployeeResType = {
  id: string;
  status: number;
  kind: number;
  username: string;
  phone: string;
  email: string;
  fullName: string;
  avatarPath: string;
  group: {
    id: string;
    name: string;
    kind: number;
  };
};

export type EmployeeSearchType = z.infer<typeof employeeSearchSchema> &
  BaseSearchType;

export type EmployeeBodyType = z.infer<ReturnType<typeof employeeSchema>>;

export type EmployeeProfileBodyType = z.infer<typeof employeeProfileSchema>;
