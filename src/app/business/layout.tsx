import { SidebarLayout } from '@/components/layout';

export default function BusinessLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return <SidebarLayout>{children}</SidebarLayout>;
}
