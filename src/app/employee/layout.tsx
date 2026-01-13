import { SidebarLayout } from '@/components/layout';
import type { ReactNode } from 'react';

export default function EmployeeLayout({ children }: { children: ReactNode }) {
  return <SidebarLayout>{children}</SidebarLayout>;
}
