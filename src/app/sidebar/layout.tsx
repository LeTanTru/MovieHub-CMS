import { SidebarLayout as SidebarLayoutComponent } from '@/components/layout';
import type { ReactNode } from 'react';

type SidebarRouteLayoutProps = { children: ReactNode };

export default function SidebarLayout({ children }: SidebarRouteLayoutProps) {
  return <SidebarLayoutComponent>{children}</SidebarLayoutComponent>;
}
