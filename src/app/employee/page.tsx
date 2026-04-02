import { EmployeeList } from '@/app/employee/_components';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Nhân viên'
};

export default async function EmployeeListPage() {
  return <EmployeeList />;
}
