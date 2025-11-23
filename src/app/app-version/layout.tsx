import { SidebarLayout } from '@/components/layout';

export default function AppVersionLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return <SidebarLayout>{children}</SidebarLayout>;
}
