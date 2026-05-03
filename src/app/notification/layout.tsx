import { SidebarLayout } from '@/components/layout';
import { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Thông báo'
};

type NotificationLayoutProps = {
  children: ReactNode;
};

export default function NotificationLayout({
  children
}: NotificationLayoutProps) {
  return <SidebarLayout>{children}</SidebarLayout>;
}
