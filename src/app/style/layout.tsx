import { SidebarLayout } from '@/components/layout';

export default function StyleLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return <SidebarLayout>{children}</SidebarLayout>;
}
