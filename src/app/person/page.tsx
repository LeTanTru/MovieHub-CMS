import { PersonTab } from '@/app/person/_components';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Đạo diễn & diễn viên'
};

export default function PersonListPage() {
  return <PersonTab />;
}
