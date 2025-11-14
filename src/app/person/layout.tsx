import { SidebarLayout } from '@/components/layout';

export default function PersonLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return <SidebarLayout>{children}</SidebarLayout>;
}
