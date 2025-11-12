import { EmployeeList } from '@/app/employee/_components';
import { queryKeys } from '@/constants';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Nhân viên'
};

export default function EmployeeListPage() {
  return <EmployeeList queryKey={queryKeys.EMPLOYEE} />;
}
