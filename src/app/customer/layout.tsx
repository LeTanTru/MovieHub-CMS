import { SidebarLayout } from '@/components/layout';

export default function CustomerLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return <SidebarLayout>{children}</SidebarLayout>;
}
