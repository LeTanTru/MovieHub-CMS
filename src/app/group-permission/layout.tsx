import { SidebarLayout } from '@/components/layout';
import { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Vai trò'
};

type GroupPermissionLayoutProps = {
  children: ReactNode;
};

export default function GroupPermissionLayout({
  children
}: GroupPermissionLayoutProps) {
  return <SidebarLayout>{children}</SidebarLayout>;
}
