import { SidebarLayout } from '@/components/layout';
import type { ReactNode } from 'react';

type StyleLayoutProps = { children: ReactNode };

export default function StyleLayout({ children }: StyleLayoutProps) {
  return <SidebarLayout>{children}</SidebarLayout>;
}
