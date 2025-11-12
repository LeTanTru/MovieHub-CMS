import { EmployeeForm } from '@/app/employee/_components';
import { queryKeys } from '@/constants';
import React from 'react';

export default function EmployeeSavePage() {
  return <EmployeeForm queryKey={queryKeys.EMPLOYEE} />;
}
