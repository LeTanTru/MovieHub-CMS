import { SettingList } from '@/app/setting/_components';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Cài đặt'
};

export default function SettingPage() {
  return <SettingList />;
}
