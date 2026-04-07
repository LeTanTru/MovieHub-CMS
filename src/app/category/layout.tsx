import { SidebarLayout } from '@/components/layout';
import type { ReactNode } from 'react';

type CategoryLayoutProps = { children: ReactNode };

export default function CategoryLayout({ children }: CategoryLayoutProps) {
  return <SidebarLayout>{children}</SidebarLayout>;
}
