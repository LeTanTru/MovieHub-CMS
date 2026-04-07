import { SidebarLayout } from '@/components/layout';
import type { ReactNode } from 'react';

type EmployeeLayoutProps = { children: ReactNode };

export default function EmployeeLayout({ children }: EmployeeLayoutProps) {
  return <SidebarLayout>{children}</SidebarLayout>;
}
