import { PersonForm } from '@/app/person/_components';
import { queryKeys } from '@/constants';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Diễn viên & Đạo diễn'
};

export default function PersonSavePage() {
  return <PersonForm queryKey={queryKeys.PERSON} />;
}
