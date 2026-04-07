import { SidebarLayout } from '@/components/layout';
import type { ReactNode } from 'react';

type AdminLayoutProps = { children: ReactNode };

export default function AdminLayout({ children }: AdminLayoutProps) {
  return <SidebarLayout>{children}</SidebarLayout>;
}
