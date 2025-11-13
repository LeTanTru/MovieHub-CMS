import { SidebarLayout } from '@/components/layout';

export default function CategoryLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return <SidebarLayout>{children}</SidebarLayout>;
}
