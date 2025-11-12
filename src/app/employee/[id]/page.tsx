import { EmployeeForm } from '@/app/employee/_components';
import { queryKeys } from '@/constants';

export default function EmployeeSavePage() {
  return <EmployeeForm queryKey={queryKeys.EMPLOYEE} />;
}
