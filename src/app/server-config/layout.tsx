import { SidebarLayout } from '@/components/layout';
import type { ReactNode } from 'react';

type ServerConfigLayoutProps = {
  children: ReactNode;
};

export default function ServerConfigLayout({
  children
}: ServerConfigLayoutProps) {
  return <SidebarLayout>{children}</SidebarLayout>;
}
