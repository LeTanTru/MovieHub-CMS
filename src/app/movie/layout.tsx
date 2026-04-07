import { SidebarLayout } from '@/components/layout';
import type { ReactNode } from 'react';

type MovieLayoutProps = { children: ReactNode };

export default function MovieLayout({ children }: MovieLayoutProps) {
  return <SidebarLayout>{children}</SidebarLayout>;
}
