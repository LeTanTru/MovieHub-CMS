import { SidebarLayout } from '@/components/layout';
import type { ReactNode } from 'react';

type UserLayoutProps = { children: ReactNode };

export default function UserLayout({ children }: UserLayoutProps) {
  return <SidebarLayout>{children}</SidebarLayout>;
}
