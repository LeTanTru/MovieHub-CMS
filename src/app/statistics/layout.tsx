import { SidebarLayout } from '@/components/layout';
import type { ReactNode } from 'react';

type StatisticsLayoutProps = { children: ReactNode };

export default function StatisticsLayout({ children }: StatisticsLayoutProps) {
  return <SidebarLayout>{children}</SidebarLayout>;
}
