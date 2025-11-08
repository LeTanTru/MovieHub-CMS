import { AdminForm } from '@/app/admin/_components';
import { queryKeys } from '@/constants';

export default async function AdminSavePage() {
  return <AdminForm queryKey={queryKeys.ACCOUNT} />;
}
