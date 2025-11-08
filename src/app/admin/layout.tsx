import { SidebarLayout } from '@/components/layout';
import { Metadata } from 'next';

export default function AdminLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return <SidebarLayout>{children}</SidebarLayout>;
}
