import { employeeSchema, employeeSearchSchema } from '@/schemaValidations';
import { GroupResType } from '@/types/group.type';
import type { BaseSearchType } from '@/types/search.type';
import { z } from 'zod';

export type EmployeeResType = {
  avatarPath: string;
  createdDate: string;
  email: string;
  fullName: string;
  group: GroupResType;
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
