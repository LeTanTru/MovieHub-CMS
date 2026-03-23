import { UserList } from '@/app/user/_components';
import { queryKeys } from '@/constants';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Người dùng'
};

export default function UserListPage() {
  return <UserList queryKey={queryKeys.USER} />;
}
