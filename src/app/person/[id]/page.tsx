import { PersonForm } from '@/app/person/_components';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Diễn viên & Đạo diễn'
};

export default function PersonSavePage() {
  return <PersonForm />;
}
