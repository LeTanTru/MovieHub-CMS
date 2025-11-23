import { SidebarList } from '@/app/sidebar/_components';
import { queryKeys } from '@/constants';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Phim mới'
};

export default function PersonListPage() {
  return <SidebarList queryKey={queryKeys.SIDEBAR} />;
}
