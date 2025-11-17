import { SidebarLayout } from '@/components/layout';

export default function MovieLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return <SidebarLayout>{children}</SidebarLayout>;
}
