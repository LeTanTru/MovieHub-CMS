import { SidebarLayout } from '@/components/layout';
import type { ReactNode } from 'react';

type PersonLayoutProps = { children: ReactNode };

export default function PersonLayout({ children }: PersonLayoutProps) {
  return <SidebarLayout>{children}</SidebarLayout>;
}
