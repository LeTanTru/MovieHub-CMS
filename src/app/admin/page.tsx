import { AdminList } from '@/app/admin/_components';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Quản trị viên'
};

export default function AdminPage() {
  return <AdminList />;
}
