import { ServerConfigList } from '@/app/server-config/_components';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Cấu hình server'
};

export default function ServerConfigListPage() {
  return <ServerConfigList />;
}
