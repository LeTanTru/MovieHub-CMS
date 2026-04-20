import { SidebarLayout } from '@/components/layout';
import type { ReactNode } from 'react';

type AppVersionLayoutProps = {
  children: ReactNode;
};

export default function AppVersionLayout({ children }: AppVersionLayoutProps) {
  return <SidebarLayout>{children}</SidebarLayout>;
}
