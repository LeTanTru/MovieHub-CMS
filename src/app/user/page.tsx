import { UserList } from '@/app/user/_components';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Người dùng'
};

export default function UserListPage() {
  return <UserList />;
}
