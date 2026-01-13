import { SidebarLayout } from '@/components/layout';
import type { ReactNode } from 'react';

export default function CategoryLayout({ children }: { children: ReactNode }) {
  return <SidebarLayout>{children}</SidebarLayout>;
}
