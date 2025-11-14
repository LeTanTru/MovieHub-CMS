import { employeeSchema, employeeSearchSchema } from '@/schemaValidations';
import { BaseSearchType } from '@/types/search.type';
import z from 'zod';

export type EmployeeResType = {
  avatarPath: string;
  createdDate: string;
  email: string;
  fullName: string;
  group: {
    createdDate: string;
    description: string;
    id: string;
    isSystemRole: boolean;
    kind: number;
    modifiedDate: string;
    name: string;
    permissions: {
      createdDate: string;
      id: string;
      modifiedDate: string;
      permissionCode: string;
      status: number;
    }[];
    status: number;
  };
  id: string;
  kind: number;
  modifiedDate: string;
  phone: string;
  status: number;
  username: string;
};

export type EmployeeSearchType = z.infer<typeof employeeSearchSchema> &
  BaseSearchType;

export type EmployeeBodyType = z.infer<ReturnType<typeof employeeSchema>>;
