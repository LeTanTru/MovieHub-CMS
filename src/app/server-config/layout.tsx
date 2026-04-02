import { SidebarLayout } from '@/components/layout';
import type { ReactNode } from 'react';

export default function ServerConfigLayout({
  children
}: {
  children: ReactNode;
}) {
  return <SidebarLayout>{children}</SidebarLayout>;
}
