import { SidebarLayout } from '@/components/layout';
import { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Vai trò'
};

export default function GroupPermissionLayout({
  children
}: {
  children: ReactNode;
}) {
  return <SidebarLayout>{children}</SidebarLayout>;
}
