import { SidebarLayout } from '@/components/layout';
import type { ReactNode } from 'react';

export default function MovieLayout({ children }: { children: ReactNode }) {
  return <SidebarLayout>{children}</SidebarLayout>;
}
