import { SidebarForm } from '@/app/sidebar/_components';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Phim hot'
};

export default function SidebarSavePage() {
  return <SidebarForm />;
}
