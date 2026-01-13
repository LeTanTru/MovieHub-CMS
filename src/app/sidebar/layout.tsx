import { SidebarLayout as SidebarLayoutComponent } from '@/components/layout';
import type { ReactNode } from 'react';

export default function SidebarLayout({ children }: { children: ReactNode }) {
  return <SidebarLayoutComponent>{children}</SidebarLayoutComponent>;
}
