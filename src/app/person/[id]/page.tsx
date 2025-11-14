import { PersonForm } from '@/app/person/_components';
import { queryKeys } from '@/constants';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Đạo diễn & diễn viên'
};

export default function PersonSavePage() {
  return <PersonForm queryKey={queryKeys.PERSON} />;
}
